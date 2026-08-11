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
    profile_pic_url: 'https://instagram.fstu2-1.fna.fbcdn.net/v/t51.82787-19/684896521_18101235280864641_2414854226926064674_n.jpg?stp=dst-jpg_s206x206_tt6&_nc_cat=107&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDU1LkMzIn0%3D&_nc_ohc=0_ivaoHkHzEQ7kNvwGrl8ns&_nc_oc=AdoK9JNChA6ic0BeNvpEnrE10j_O1f6ilytAWSpz5dAdHAI_H3FQxBVroa6SPACoUdjE7loSHNC-4RI4ISmXNJkt&_nc_zt=24&_nc_ht=instagram.fstu2-1.fna&edm=AP4hL3IEAAAA&_nc_gid=rv1CdPQpV-6OI237OkZWrg&_nc_tpa=Q5bMBQJVWvR8gLvOlzeQ5_2BJcBNwZ6O-zMUnYhERE6XFs2czVJgf0LLzhBGVoezfYdkKWe48nbWKoJ3pA&oh=00_AQGf6OZfTSmvOA_HJr3agz6FRb5-qlNOUW_vTJOMEia7TQ&oe=6A805497',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];


export const INITIAL_MOCK_POSTS: Post[] = [];

export const INITIAL_MOCK_LOGS: PublicationLog[] = [];

class MockStore {
  private posts: Post[] = [...INITIAL_MOCK_POSTS];
  private accounts: InstagramAccount[] = [...INITIAL_MOCK_ACCOUNTS];
  private logs: PublicationLog[] = [...INITIAL_MOCK_LOGS];
  private profile: Profile = {
    id: 'user-demo-123',
    email: 'jrbrandt@webdesigner.com',
    full_name: 'José Roberto Machado Brandt',
    avatar_url: 'https://instagram.fstu2-1.fna.fbcdn.net/v/t51.82787-19/684896521_18101235280864641_2414854226926064674_n.jpg?stp=dst-jpg_s206x206_tt6&_nc_cat=107&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDU1LkMzIn0%3D&_nc_ohc=0_ivaoHkHzEQ7kNvwGrl8ns&_nc_oc=AdoK9JNChA6ic0BeNvpEnrE10j_O1f6ilytAWSpz5dAdHAI_H3FQxBVroa6SPACoUdjE7loSHNC-4RI4ISmXNJkt&_nc_zt=24&_nc_ht=instagram.fstu2-1.fna&edm=AP4hL3IEAAAA&_nc_gid=rv1CdPQpV-6OI237OkZWrg&_nc_tpa=Q5bMBQJVWvR8gLvOlzeQ5_2BJcBNwZ6O-zMUnYhERE6XFs2czVJgf0LLzhBGVoezfYdkKWe48nbWKoJ3pA&oh=00_AQGf6OZfTSmvOA_HJr3agz6FRb5-qlNOUW_vTJOMEia7TQ&oe=6A805497',
    default_timezone: 'America/Sao_Paulo',
    ai_default_tone: 'Criativo & Descontraído',
    created_at: new Date().toISOString(),
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
