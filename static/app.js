
// BlogSphere Static App JavaScript

class BlogApp {
    constructor() {
        this.currentUser = null;
        this.currentPost = null;
        this.posts = [];
        this.users = [];
        this.comments = [];
        this.likes = [];
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.checkAuth();
        this.renderPosts();
    }

    // Data Management
    loadData() {
        this.posts = JSON.parse(localStorage.getItem('blog_posts')) || [];
        this.users = JSON.parse(localStorage.getItem('blog_users')) || [];
        this.comments = JSON.parse(localStorage.getItem('blog_comments')) || [];
        this.likes = JSON.parse(localStorage.getItem('blog_likes')) || [];
        
        // Create admin user if doesn't exist
        if (!this.users.find(u => u.username === 'admin')) {
            this.users.push({
                id: this.generateId(),
                username: 'admin',
                email: 'admin@example.com',
                password: 'admin123',
                isAdmin: true,
                createdAt: new Date().toISOString()
            });
            this.saveData();
        }
    }

    saveData() {
        localStorage.setItem('blog_posts', JSON.stringify(this.posts));
        localStorage.setItem('blog_users', JSON.stringify(this.users));
        localStorage.setItem('blog_comments', JSON.stringify(this.comments));
        localStorage.setItem('blog_likes', JSON.stringify(this.likes));
    }

    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    // Authentication
    checkAuth() {
        const userData = localStorage.getItem('current_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.updateNavigation(true);
        }
    }

    login(username, password) {
        const user = this.users.find(u => u.username === username && u.password === password);
        if (user) {
            this.currentUser = user;
            localStorage.setItem('current_user', JSON.stringify(user));
            this.updateNavigation(true);
            this.showFlashMessage('Login successful!', 'success');
            this.showPage('home');
            return true;
        }
        this.showFlashMessage('Invalid username or password', 'danger');
        return false;
    }

    register(username, email, password) {
        if (this.users.find(u => u.username === username)) {
            this.showFlashMessage('Username already exists', 'danger');
            return false;
        }
        if (this.users.find(u => u.email === email)) {
            this.showFlashMessage('Email already exists', 'danger');
            return false;
        }

        const user = {
            id: this.generateId(),
            username,
            email,
            password,
            isAdmin: false,
            createdAt: new Date().toISOString()
        };

        this.users.push(user);
        this.saveData();
        this.showFlashMessage('Registration successful! Please login.', 'success');
        this.showPage('login');
        return true;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('current_user');
        this.updateNavigation(false);
        this.showFlashMessage('You have been logged out successfully.', 'info');
        this.showPage('home');
    }

    updateNavigation(isAuthenticated) {
        const loginNav = document.getElementById('login-nav');
        const registerNav = document.getElementById('register-nav');
        const userDropdown = document.getElementById('user-dropdown');
        const createPostNav = document.getElementById('create-post-nav');
        const adminLink = document.getElementById('admin-link');
        const guestWelcome = document.getElementById('guest-welcome');

        if (isAuthenticated) {
            loginNav.style.display = 'none';
            registerNav.style.display = 'none';
            userDropdown.style.display = 'block';
            createPostNav.style.display = 'block';
            if (guestWelcome) guestWelcome.style.display = 'none';
            
            document.getElementById('username-display').textContent = this.currentUser.username;
            
            if (this.currentUser.isAdmin) {
                adminLink.style.display = 'block';
            }
        } else {
            loginNav.style.display = 'block';
            registerNav.style.display = 'block';
            userDropdown.style.display = 'none';
            createPostNav.style.display = 'none';
            adminLink.style.display = 'none';
            if (guestWelcome) guestWelcome.style.display = 'block';
        }
    }

    // UI Management
    showPage(pageId) {
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.style.display = 'none');
        
        const targetPage = document.getElementById(pageId + '-page');
        if (targetPage) {
            targetPage.style.display = 'block';
            
            // Load page-specific data
            if (pageId === 'home') {
                this.renderPosts();
            } else if (pageId === 'profile' && this.currentUser) {
                this.renderProfile();
            }
        }
    }

    showFlashMessage(message, type) {
        const container = document.getElementById('flash-messages');
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        container.appendChild(alert);
        
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }

    // Posts Management
    createPost(title, content, images) {
        if (!this.currentUser) return false;

        const post = {
            id: this.generateId(),
            userId: this.currentUser.id,
            title,
            content,
            images: images || [],
            createdAt: new Date().toISOString()
        };

        this.posts.unshift(post);
        this.saveData();
        this.showFlashMessage('Post created successfully!', 'success');
        this.showPage('home');
        return true;
    }

    renderPosts() {
        const container = document.getElementById('posts-container');
        container.innerHTML = '';

        if (this.posts.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-newspaper fa-3x text-muted mb-3"></i>
                    <h4 class="text-muted">No posts yet</h4>
                    <p class="text-muted">Be the first to share your thoughts!</p>
                    ${this.currentUser ? '<button class="btn btn-primary" onclick="app.showPage(\'create-post\')"><i class="fas fa-plus me-2"></i>Create Your First Post</button>' : ''}
                </div>
            `;
            return;
        }

        this.posts.forEach(post => {
            const author = this.users.find(u => u.id === post.userId);
            const likeCount = this.likes.filter(l => l.postId === post.id).length;
            const commentCount = this.comments.filter(c => c.postId === post.id).length;
            
            const postElement = document.createElement('div');
            postElement.className = 'card mb-4 shadow-sm post-card';
            postElement.innerHTML = `
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h5 class="card-title cursor-pointer" onclick="app.showPostDetail('${post.id}')">${post.title}</h5>
                            <small class="text-muted">
                                By <strong>${author ? author.username : 'Unknown'}</strong> • 
                                ${this.formatDate(post.createdAt)}
                            </small>
                        </div>
                    </div>
                    <p class="card-text text-truncate-3">${post.content}</p>
                    ${post.images && post.images.length > 0 ? `
                        <div class="post-images">
                            ${post.images.slice(0, 3).map(img => `<img src="${img}" alt="Post image">`).join('')}
                            ${post.images.length > 3 ? `<div class="text-center align-self-center"><small class="text-muted">+${post.images.length - 3} more</small></div>` : ''}
                        </div>
                    ` : ''}
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <div>
                            <button class="btn btn-outline-danger btn-sm" onclick="app.toggleLike('${post.id}')">
                                <i class="fas fa-heart me-1"></i>${likeCount}
                            </button>
                            <button class="btn btn-outline-primary btn-sm ms-2" onclick="app.showPostDetail('${post.id}')">
                                <i class="fas fa-comments me-1"></i>${commentCount}
                            </button>
                        </div>
                        <button class="btn btn-primary btn-sm" onclick="app.showPostDetail('${post.id}')">
                            Read More
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(postElement);
        });
    }

    renderProfile() {
        if (!this.currentUser) return;

        const userPosts = this.posts.filter(p => p.userId === this.currentUser.id);
        const totalLikes = userPosts.reduce((total, post) => 
            total + this.likes.filter(l => l.postId === post.id).length, 0);
        const totalComments = userPosts.reduce((total, post) => 
            total + this.comments.filter(c => c.postId === post.id).length, 0);

        document.getElementById('profile-username').textContent = this.currentUser.username;
        document.getElementById('profile-email').textContent = this.currentUser.email;
        document.getElementById('profile-created').textContent = new Date(this.currentUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        document.getElementById('profile-posts-count').textContent = userPosts.length;
        document.getElementById('profile-likes-count').textContent = totalLikes;
        document.getElementById('profile-comments-count').textContent = totalComments;

        const container = document.getElementById('user-posts-container');
        container.innerHTML = '';

        if (userPosts.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-newspaper fa-3x text-muted mb-3"></i>
                    <h4 class="text-muted">No posts yet</h4>
                    <p class="text-muted">Start sharing your thoughts with the world!</p>
                    <button class="btn btn-primary" onclick="app.showPage('create-post')">
                        <i class="fas fa-plus me-2"></i>Create Your First Post
                    </button>
                </div>
            `;
            return;
        }

        userPosts.forEach(post => {
            const likeCount = this.likes.filter(l => l.postId === post.id).length;
            const commentCount = this.comments.filter(c => c.postId === post.id).length;
            
            const postElement = document.createElement('div');
            postElement.className = 'card mb-4 shadow-sm';
            postElement.innerHTML = `
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h5 class="card-title cursor-pointer" onclick="app.showPostDetail('${post.id}')">${post.title}</h5>
                            <small class="text-muted">${this.formatDate(post.createdAt)}</small>
                        </div>
                    </div>
                    <p class="card-text text-truncate-2">${post.content}</p>
                    <div class="text-muted">
                        <i class="fas fa-heart me-1"></i>${likeCount}
                        <i class="fas fa-comments ms-3 me-1"></i>${commentCount}
                    </div>
                </div>
            `;
            container.appendChild(postElement);
        });
    }

    showPostDetail(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        this.currentPost = post;
        const author = this.users.find(u => u.id === post.userId);
        const likeCount = this.likes.filter(l => l.postId === post.id).length;
        const commentCount = this.comments.filter(c => c.postId === post.id).length;

        document.getElementById('modal-post-title').textContent = post.title;
        document.getElementById('modal-post-author').textContent = author ? author.username : 'Unknown';
        document.getElementById('modal-post-date').textContent = this.formatDate(post.createdAt);
        document.getElementById('modal-post-content').textContent = post.content;
        document.getElementById('modal-like-count').textContent = likeCount;
        document.getElementById('modal-comment-count').textContent = commentCount;

        // Render images
        const imagesContainer = document.getElementById('modal-post-images');
        imagesContainer.innerHTML = '';
        if (post.images && post.images.length > 0) {
            const imagesDiv = document.createElement('div');
            imagesDiv.className = 'post-images';
            post.images.forEach(img => {
                const imgElement = document.createElement('img');
                imgElement.src = img;
                imgElement.alt = 'Post image';
                imagesDiv.appendChild(imgElement);
            });
            imagesContainer.appendChild(imagesDiv);
        }

        this.renderComments(postId);

        const modal = new bootstrap.Modal(document.getElementById('postModal'));
        modal.show();
    }

    renderComments(postId) {
        const postComments = this.comments.filter(c => c.postId === postId);
        const container = document.getElementById('comments-container');
        container.innerHTML = '';

        postComments.forEach(comment => {
            const author = this.users.find(u => u.id === comment.userId);
            const commentElement = document.createElement('div');
            commentElement.className = 'comment';
            commentElement.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <strong>${author ? author.username : 'Unknown'}</strong>
                        <small class="text-muted ms-2">${this.formatDate(comment.createdAt)}</small>
                    </div>
                </div>
                <p class="mb-0 mt-1">${comment.content}</p>
            `;
            container.appendChild(commentElement);
        });
    }

    addComment(postId, content) {
        if (!this.currentUser) return false;

        const comment = {
            id: this.generateId(),
            postId,
            userId: this.currentUser.id,
            content,
            createdAt: new Date().toISOString()
        };

        this.comments.push(comment);
        this.saveData();
        this.renderComments(postId);
        
        // Update comment count in modal
        const commentCount = this.comments.filter(c => c.postId === postId).length;
        document.getElementById('modal-comment-count').textContent = commentCount;
        
        return true;
    }

    toggleLike(postId) {
        if (!this.currentUser) {
            this.showFlashMessage('Please login to like posts', 'warning');
            return;
        }

        const existingLike = this.likes.find(l => l.postId === postId && l.userId === this.currentUser.id);
        
        if (existingLike) {
            this.likes = this.likes.filter(l => l.id !== existingLike.id);
        } else {
            this.likes.push({
                id: this.generateId(),
                postId,
                userId: this.currentUser.id,
                createdAt: new Date().toISOString()
            });
        }

        this.saveData();
        
        // Update UI
        const likeCount = this.likes.filter(l => l.postId === postId).length;
        const likeCountElements = document.querySelectorAll(`[onclick="app.toggleLike('${postId}')"] .fas + *`);
        likeCountElements.forEach(el => el.textContent = likeCount);
        
        if (this.currentPost && this.currentPost.id === postId) {
            document.getElementById('modal-like-count').textContent = likeCount;
        }
        
        this.renderPosts(); // Refresh posts to update like counts
    }

    searchPosts() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const postCards = document.querySelectorAll('.post-card');
        
        postCards.forEach(card => {
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            const content = card.querySelector('.card-text').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || content.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    // Event Listeners
    setupEventListeners() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            this.login(username, password);
        });

        // Register form
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            this.register(username, email, password);
        });

        // Create post form
        document.getElementById('create-post-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('post-title').value;
            const content = document.getElementById('post-content').value;
            const imageFiles = document.getElementById('post-images').files;
            
            // Convert images to base64 (simplified for demo)
            const images = [];
            if (imageFiles.length > 0) {
                Array.from(imageFiles).forEach((file, index) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        images.push(e.target.result);
                        if (images.length === imageFiles.length) {
                            this.createPost(title, content, images);
                        }
                    };
                    reader.readAsDataURL(file);
                });
            } else {
                this.createPost(title, content, images);
            }
        });

        // Comment form
        document.getElementById('comment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const content = document.getElementById('comment-input').value;
            if (content.trim() && this.currentPost) {
                this.addComment(this.currentPost.id, content);
                document.getElementById('comment-input').value = '';
            }
        });

        // Search input
        document.getElementById('search-input').addEventListener('input', () => {
            this.searchPosts();
        });
    }

    // Utility functions
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Global functions for HTML onclick events
function showPage(pageId) {
    app.showPage(pageId);
}

function logout() {
    app.logout();
}

function toggleLike(postId) {
    app.toggleLike(postId);
}

function searchPosts() {
    app.searchPosts();
}

// Initialize app
const app = new BlogApp();
