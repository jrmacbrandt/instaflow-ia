import { Post, InstagramAccount, PublicationLog, Profile } from '@/lib/types/database';

export const INITIAL_MOCK_ACCOUNTS: InstagramAccount[] = [
  {
    id: 'acc-1',
    user_id: 'user-demo-123',
    instagram_business_account_id: '37370166699293226',
    facebook_page_id: '1669236564150637',
    access_token: 'IGAAXuKWxzyW1BZAGJPZAnB0OHpzLVNFTEhrNURMMDVxQ3hKbFFfd3dVa2VWYUpLUTZAsVkdZAWHRTajNndXBzZAjVua3U1VE9hRWhIM1Q4Y0E4WktJc3NyNjVpUlNlVGpQdEt5V3l1dktCS1VScThSMnJwWFEzWEdlOVQzUUNIZAi1IbwZDZD',
    token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 dias
    instagram_username: 'jrbrandt.webdesigner',
    profile_pic_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];


export const INITIAL_MOCK_POSTS: Post[] = [
  {
    id: 'post-1',
    user_id: 'user-demo-123',
    instagram_account_id: 'acc-1',
    caption: '✨ Nova coleção Primavera/Verão acabou de chegar no site! 🌸👗 Tecidos leves, estampas exclusivas e caimento perfeito. Qual o seu look favorito? Link na bio!\n\n#moda #estilo #primavera #outfit #lookdodia',
    media_type: 'CAROUSEL',
    media_urls: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80'
    ],
    scheduled_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // Today + 2h
    status: 'scheduled',
    ai_generated: true,
    ai_prompt: 'Legenda para lançamento de coleção de moda feminina',
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'post-2',
    user_id: 'user-demo-123',
    instagram_account_id: 'acc-2',
    caption: '🏝️ 5 Lugares imperdíveis em Fernando de Noronha! Guarde este post para sua próxima viagem. Qual dessas praias é a sua dos sonhos? 🌊☀️\n\n#viagem #noronhadossonhos #brasil #turismo',
    media_type: 'IMAGE',
    media_urls: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80'
    ],
    scheduled_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // Yesterday
    status: 'published',
    instagram_post_id: '17988827361928371',
    instagram_permalink: 'https://instagram.com/p/C_mock_post_noronha',
    ai_generated: true,
    created_at: new Date(Date.now() - 25 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'post-3',
    user_id: 'user-demo-123',
    instagram_account_id: 'acc-1',
    caption: '💡 3 Dicas infalíveis para combinar acessórios dourados com qualquer peça de roupa neutra. Salve pra não esquecer! ✨\n\n#dicasdemoda #acessorios #jewelry #moda',
    media_type: 'IMAGE',
    media_urls: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80'
    ],
    scheduled_at: new Date(Date.now() + 48 * 3600 * 1000).toISOString(), // Day after tomorrow
    status: 'scheduled',
    ai_generated: false,
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'post-4',
    user_id: 'user-demo-123',
    instagram_account_id: 'acc-2',
    caption: 'Rascunho de post sobre as melhores malas de viagem para despachar.',
    media_type: 'IMAGE',
    media_urls: [
      'https://images.unsplash.com/photo-1565026057447-b8899f2911a8?w=800&auto=format&fit=crop&q=80'
    ],
    scheduled_at: null,
    status: 'draft',
    ai_generated: false,
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'post-5',
    user_id: 'user-demo-123',
    instagram_account_id: 'acc-1',
    caption: 'Bastidores do nosso novo ensaio fotográfico no estúdio! 📸✨',
    media_type: 'VIDEO',
    media_urls: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
    ],
    scheduled_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    status: 'failed',
    failure_reason: 'Instagram API Error: Token de acesso expirado. Re-autenticação necessária (Code: 190).',
    created_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  }
];

export const INITIAL_MOCK_LOGS: PublicationLog[] = [
  {
    id: 'log-1',
    post_id: 'post-2',
    attempt: 1,
    action: 'create_media_container',
    request_payload: { image_url: 'https://images.unsplash.com/...', caption: '🏝️ 5 Lugares imperdíveis...' },
    response_status: 200,
    response_body: { id: '17988827361928371_container' },
    created_at: new Date(Date.now() - 24 * 3600 * 1000 + 1000).toISOString(),
  },
  {
    id: 'log-2',
    post_id: 'post-2',
    attempt: 1,
    action: 'publish_media',
    request_payload: { creation_id: '17988827361928371_container' },
    response_status: 200,
    response_body: { id: '17988827361928371', permalink: 'https://instagram.com/p/C_mock_post_noronha' },
    created_at: new Date(Date.now() - 24 * 3600 * 1000 + 4000).toISOString(),
  },
  {
    id: 'log-3',
    post_id: 'post-5',
    attempt: 1,
    action: 'create_media_container',
    request_payload: { video_url: 'https://commondatastorage...', media_type: 'REELS' },
    response_status: 401,
    response_body: { error: { message: 'Invalid OAuth access token', code: 190, fbtrace_id: 'AxY98110xM' } },
    error_message: 'Token de acesso expirado. Re-autenticação necessária.',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  }
];

class MockStore {
  private posts: Post[] = [...INITIAL_MOCK_POSTS];
  private accounts: InstagramAccount[] = [...INITIAL_MOCK_ACCOUNTS];
  private logs: PublicationLog[] = [...INITIAL_MOCK_LOGS];
  private profile: Profile = {
    id: 'user-demo-123',
    email: 'demostrator@instaflow.ai',
    full_name: 'Ana Silva (Social Media)',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    default_timezone: 'America/Sao_Paulo',
    ai_default_tone: 'Criativo & Descontraído',
    created_at: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  getPosts(): Post[] {
    return this.posts.map(post => {
      const account = this.accounts.find(a => a.id === post.instagram_account_id) || null;
      return { ...post, instagram_account: account };
    });
  }

  getPostById(id: string): Post | null {
    const post = this.posts.find(p => p.id === id);
    if (!post) return null;
    const account = this.accounts.find(a => a.id === post.instagram_account_id) || null;
    return { ...post, instagram_account: account };
  }

  savePost(postData: Partial<Post>): Post {
    if (postData.id) {
      const idx = this.posts.findIndex(p => p.id === postData.id);
      if (idx !== -1) {
        this.posts[idx] = {
          ...this.posts[idx],
          ...postData,
          updated_at: new Date().toISOString(),
        };
        return this.getPostById(postData.id)!;
      }
    }

    const newPost: Post = {
      id: `post-${Date.now()}`,
      user_id: 'user-demo-123',
      instagram_account_id: postData.instagram_account_id || this.accounts[0]?.id || null,
      caption: postData.caption || '',
      media_type: postData.media_type || 'IMAGE',
      media_urls: postData.media_urls || [],
      scheduled_at: postData.scheduled_at || null,
      status: postData.status || (postData.scheduled_at ? 'scheduled' : 'draft'),
      ai_generated: !!postData.ai_generated,
      ai_prompt: postData.ai_prompt || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.posts.unshift(newPost);
    return this.getPostById(newPost.id)!;
  }

  deletePost(id: string): boolean {
    const idx = this.posts.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.posts.splice(idx, 1);
      return true;
    }
    return false;
  }

  duplicatePost(id: string): Post | null {
    const original = this.getPostById(id);
    if (!original) return null;

    const dup: Partial<Post> = {
      caption: `${original.caption} (Cópia)`,
      media_type: original.media_type,
      media_urls: [...original.media_urls],
      instagram_account_id: original.instagram_account_id,
      scheduled_at: null,
      status: 'draft',
      ai_generated: original.ai_generated,
      ai_prompt: original.ai_prompt,
    };
    return this.savePost(dup);
  }

  getAccounts(): InstagramAccount[] {
    return this.accounts;
  }

  addAccount(acc: Partial<InstagramAccount>): InstagramAccount {
    const newAcc: InstagramAccount = {
      id: `acc-${Date.now()}`,
      user_id: 'user-demo-123',
      instagram_business_account_id: acc.instagram_business_account_id || `${Date.now()}`,
      facebook_page_id: acc.facebook_page_id || `${Date.now()}_page`,
      access_token: acc.access_token || 'EAAG...mock_long_lived_token',
      token_expires_at: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString(),
      instagram_username: acc.instagram_username || 'novo_perfil_insta',
      profile_pic_url: acc.profile_pic_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.accounts.push(newAcc);
    return newAcc;
  }

  deleteAccount(id: string): boolean {
    const idx = this.accounts.findIndex(a => a.id === id);
    if (idx !== -1) {
      this.accounts.splice(idx, 1);
      return true;
    }
    return false;
  }

  getLogs(postId?: string): PublicationLog[] {
    if (postId) {
      return this.logs.filter(l => l.post_id === postId);
    }
    return this.logs;
  }

  addLog(log: Omit<PublicationLog, 'id' | 'created_at'>): PublicationLog {
    const newLog: PublicationLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    this.logs.unshift(newLog);
    return newLog;
  }

  getProfile(): Profile {
    return this.profile;
  }

  updateProfile(updates: Partial<Profile>): Profile {
    this.profile = {
      ...this.profile,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return this.profile;
  }
}

// Singleton global in-memory store for dev/testing
export const mockStore = new MockStore();
