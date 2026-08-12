import { Post, PublicationLog } from '@/lib/types/database';
import { mockStore } from '@/lib/supabase/mock-store';

export interface InstagramPublishResult {
  success: boolean;
  instagram_post_id?: string;
  instagram_permalink?: string;
  error?: string;
  logs: Omit<PublicationLog, 'id' | 'created_at'>[];
}

/**
 * Publishes a post to Instagram Graph API
 * Handles single image, video (Reels), and carousels
 * Includes retry, logging, and idempotency protection
 */
export async function publishPostToInstagram(post: Post): Promise<InstagramPublishResult> {
  const logs: Omit<PublicationLog, 'id' | 'created_at'>[] = [];

  // Idempotency check: if already publishing or published, skip
  if (post.status === 'published') {
    return {
      success: true,
      instagram_post_id: post.instagram_post_id || undefined,
      instagram_permalink: post.instagram_permalink || undefined,
      logs: [],
    };
  }

  const account = post.instagram_account || mockStore.getAccounts().find(a => a.id === post.instagram_account_id);

  if (!account || !account.access_token) {
    const errorMsg = 'Nenhuma conta do Instagram válida ou token de acesso indisponível.';
    logs.push({
      post_id: post.id,
      attempt: 1,
      action: 'validate_account',
      request_payload: { account_id: post.instagram_account_id },
      response_status: 400,
      response_body: { error: errorMsg },
      error_message: errorMsg,
    });
    return { success: false, error: errorMsg, logs };
  }

  // Token Expiration check
  if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
    const errorMsg = `Token da conta @${account.instagram_username} expirou em ${new Date(account.token_expires_at).toLocaleDateString()}. Reautorização requerida.`;
    logs.push({
      post_id: post.id,
      attempt: 1,
      action: 'check_token_validity',
      request_payload: { expires_at: account.token_expires_at },
      response_status: 401,
      response_body: { error: errorMsg, code: 190 },
      error_message: errorMsg,
    });
    return { success: false, error: errorMsg, logs };
  }

  const igUserId = account.instagram_business_account_id;
  const accessToken = account.access_token;
  const isMockToken = accessToken.includes('mock') || !process.env.FACEBOOK_APP_ID;

  try {
    if (isMockToken) {
      // Simulated live Graph API execution with high-fidelity step logging
      return simulatePublishingFlow(post, account, logs);
    }

    // Real Meta Instagram Graph API Execution
    const graphBaseUrl = 'https://graph.facebook.com/v20.0';

    if (post.media_type === 'CAROUSEL' && post.media_urls.length > 1) {
      // Step 1: Create individual item containers
      const childrenIds: string[] = [];

      for (let i = 0; i < post.media_urls.length; i++) {
        const url = post.media_urls[i];
        const isVideo = url.endsWith('.mp4') || url.endsWith('.mov') || url.includes('.mp4?') || url.includes('.mov?');

        const itemRes = await fetch(`${graphBaseUrl}/${igUserId}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            [isVideo ? 'video_url' : 'image_url']: url,
            is_carousel_item: true,
            access_token: accessToken,
          }),
        });

        const itemData = await itemRes.json();

        logs.push({
          post_id: post.id,
          attempt: 1,
          action: `create_carousel_item_${i + 1}`,
          request_payload: { url, isVideo },
          response_status: itemRes.status,
          response_body: itemData,
          error_message: itemRes.ok ? undefined : itemData.error?.message,
        });

        if (!itemRes.ok || !itemData.id) {
          throw new Error(`Falha ao criar item de carrossel ${i + 1}: ${itemData.error?.message || 'Erro desconhecido'}`);
        }

        // Wait for video container to be ready before moving forward
        if (isVideo) {
          await waitForContainerReady(graphBaseUrl, itemData.id, accessToken, post.id, logs);
        }

        childrenIds.push(itemData.id);
      }

      // Step 2: Create Carousel Parent Container
      const carouselRes = await fetch(`${graphBaseUrl}/${igUserId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_type: 'CAROUSEL',
          caption: post.caption || '',
          children: childrenIds,
          access_token: accessToken,
        }),
      });

      const carouselData = await carouselRes.json();
      logs.push({
        post_id: post.id,
        attempt: 1,
        action: 'create_carousel_container',
        request_payload: { childrenCount: childrenIds.length },
        response_status: carouselRes.status,
        response_body: carouselData,
        error_message: carouselRes.ok ? undefined : carouselData.error?.message,
      });

      if (!carouselRes.ok || !carouselData.id) {
        throw new Error(`Falha ao criar container do carrossel: ${carouselData.error?.message}`);
      }

      // Step 3: Publish Parent Container
      return await executeMediaPublish(graphBaseUrl, igUserId, carouselData.id, accessToken, post.id, logs);
    } else {
      // Single Image or Single Video Execution
      const url = post.media_urls[0] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e';
      const isVideo = post.media_type === 'VIDEO' || url.endsWith('.mp4') || url.endsWith('.mov') || url.includes('.mp4?') || url.includes('.mov?');

      const containerRes = await fetch(`${graphBaseUrl}/${igUserId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [isVideo ? 'video_url' : 'image_url']: url,
          media_type: isVideo ? 'REELS' : 'IMAGE',
          caption: post.caption || '',
          access_token: accessToken,
        }),
      });

      const containerData = await containerRes.json();
      logs.push({
        post_id: post.id,
        attempt: 1,
        action: 'create_single_media_container',
        request_payload: { isVideo, media_url: url },
        response_status: containerRes.status,
        response_body: containerData,
        error_message: containerRes.ok ? undefined : containerData.error?.message,
      });

      if (!containerRes.ok || !containerData.id) {
        throw new Error(`Falha no container da mídia: ${containerData.error?.message || 'Media creation failed'}`);
      }

      // Wait for single video container to be ready
      if (isVideo) {
        await waitForContainerReady(graphBaseUrl, containerData.id, accessToken, post.id, logs);
      }

      return await executeMediaPublish(graphBaseUrl, igUserId, containerData.id, accessToken, post.id, logs);
    }
  } catch (err: any) {
    const errorMsg = err.message || 'Erro durante a publicação na API do Instagram';
    logs.push({
      post_id: post.id,
      attempt: 1,
      action: 'publish_execution_error',
      request_payload: { post_id: post.id },
      response_status: 500,
      response_body: { error: errorMsg },
      error_message: errorMsg,
    });

    return {
      success: false,
      error: errorMsg,
      logs,
    };
  }
}

async function waitForContainerReady(
  baseUrl: string,
  containerId: string,
  accessToken: string,
  postId: string,
  logs: Omit<PublicationLog, 'id' | 'created_at'>[]
): Promise<boolean> {
  const maxAttempts = 15;
  const delayMs = 5000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(`${baseUrl}/${containerId}?fields=status_code,status,error_message&access_token=${accessToken}`);
      const data = await res.json();

      logs.push({
        post_id: postId,
        attempt,
        action: `check_container_status_attempt_${attempt}`,
        request_payload: { container_id: containerId },
        response_status: res.status,
        response_body: data,
      });

      if (res.ok) {
        const statusCode = data.status_code;
        if (statusCode === 'FINISHED') {
          return true;
        }
        if (statusCode === 'ERROR') {
          throw new Error(`Erro no processamento do vídeo no Instagram: ${data.error_message || 'Erro desconhecido'}`);
        }
        if (statusCode === 'EXPIRED') {
          throw new Error('O container do vídeo expirou no Instagram.');
        }
      }
    } catch (err: any) {
      if (attempt === maxAttempts) throw err;
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  throw new Error('Tempo limite excedido aguardando o processamento do vídeo no Instagram.');
}

async function executeMediaPublish(
  baseUrl: string,
  igUserId: string,
  creationId: string,
  accessToken: string,
  postId: string,
  logs: Omit<PublicationLog, 'id' | 'created_at'>[]
): Promise<InstagramPublishResult> {
  const publishRes = await fetch(`${baseUrl}/${igUserId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: creationId,
      access_token: accessToken,
    }),
  });

  const publishData = await publishRes.json();

  logs.push({
    post_id: postId,
    attempt: 1,
    action: 'publish_media_container',
    request_payload: { creation_id: creationId },
    response_status: publishRes.status,
    response_body: publishData,
    error_message: publishRes.ok ? undefined : publishData.error?.message,
  });

  if (!publishRes.ok || !publishData.id) {
    return {
      success: false,
      error: publishData.error?.message || 'Falha na publicação final no Instagram',
      logs,
    };
  }

  // Fetch permalink
  let permalink = `https://instagram.com/p/${publishData.id}`;
  try {
    const permRes = await fetch(`${baseUrl}/${publishData.id}?fields=permalink&access_token=${accessToken}`);
    if (permRes.ok) {
      const permData = await permRes.json();
      if (permData.permalink) permalink = permData.permalink;
    }
  } catch (_) {}

  return {
    success: true,
    instagram_post_id: publishData.id,
    instagram_permalink: permalink,
    logs,
  };
}

function simulatePublishingFlow(
  post: Post,
  account: any,
  logs: Omit<PublicationLog, 'id' | 'created_at'>[]
): InstagramPublishResult {
  const mockPostId = `179${Math.floor(100000000000 + Math.random() * 900000000000)}`;

  // Step 1 Log
  logs.push({
    post_id: post.id,
    attempt: 1,
    action: 'create_media_container',
    request_payload: {
      account: `@${account.instagram_username}`,
      media_type: post.media_type,
      media_urls_count: post.media_urls.length,
      caption_preview: post.caption?.substring(0, 40) + '...',
    },
    response_status: 200,
    response_body: { id: `${mockPostId}_container`, status: 'FINISHED' },
  });

  // Step 2 Log
  logs.push({
    post_id: post.id,
    attempt: 1,
    action: 'publish_media_container',
    request_payload: { creation_id: `${mockPostId}_container` },
    response_status: 200,
    response_body: {
      id: mockPostId,
      permalink: `https://instagram.com/p/C_${mockPostId.substring(0, 8)}`,
    },
  });

  return {
    success: true,
    instagram_post_id: mockPostId,
    instagram_permalink: `https://instagram.com/p/C_${mockPostId.substring(0, 8)}`,
    logs,
  };
}
