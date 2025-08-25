// Blog form data storage
        let blogData = {
            title: '',
            category: '',
            content: '',
            image: null,
            tags: []
        };

        // DOM elements
        const imageUploadSection = document.getElementById('imageUploadSection');
        const imageInput = document.getElementById('imageInput');
        const imagePreview = document.getElementById('imagePreview');
        const previewImage = document.getElementById('previewImage');
        const removeImageBtn = document.getElementById('removeImage');
        const tagsInput = document.getElementById('tags');
        const tagsDisplay = document.getElementById('tagsDisplay');
        const contentTextarea = document.getElementById('content');
        const wordCount = document.getElementById('wordCount');
        const blogForm = document.getElementById('blogForm');

        // Image upload handling
        imageUploadSection.addEventListener('click', () => imageInput.click());

        imageInput.addEventListener('change', handleImageSelect);

        function handleImageSelect(e) {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 10 * 1024 * 1024) {
                    alert('File size must be less than 10MB');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImage.src = e.target.result;
                    imagePreview.style.display = 'block';
                    blogData.image = file;
                };
                reader.readAsDataURL(file);
            }
        }

        // Drag and drop functionality
        imageUploadSection.addEventListener('dragover', (e) => {
            e.preventDefault();
            imageUploadSection.classList.add('dragover');
        });

        imageUploadSection.addEventListener('dragleave', () => {
            imageUploadSection.classList.remove('dragover');
        });

        imageUploadSection.addEventListener('drop', (e) => {
            e.preventDefault();
            imageUploadSection.classList.remove('dragover');
            
            const file = e.dataTransfer.files && e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                try {
                    const dt = new DataTransfer();
                    dt.items.add(file);
                    imageInput.files = dt.files;
                } catch (err) {
                    console.warn('Could not set input.files programmatically:', err);
                }
                handleImageSelect({ target: { files: [file] } });
            }
        });

        // Remove image
        removeImageBtn.addEventListener('click', () => {
            imagePreview.style.display = 'none';
            imageInput.value = '';
            blogData.image = null;
        });

        // Tags functionality
        tagsInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
            }
        });

        function addTag() {
            const tagText = tagsInput.value.trim();
            if (tagText && !blogData.tags.includes(tagText)) {
                blogData.tags.push(tagText);
                renderTags();
                tagsInput.value = '';
            }
        }

        function removeTag(tagToRemove) {
            blogData.tags = blogData.tags.filter(tag => tag !== tagToRemove);
            renderTags();
        }

        function renderTags() {
            tagsDisplay.innerHTML = blogData.tags.map(tag => `
                <div class="tag">
                    ${tag}
                    <button type="button" class="tag-remove" onclick="removeTag('${tag}')">×</button>
                </div>
            `).join('');
        }

        // Word count
        contentTextarea.addEventListener('input', () => {
            const words = contentTextarea.value.trim().split(/\s+/).filter(word => word.length > 0);
            wordCount.textContent = `${words.length} words`;
        });

        // Form submission
        // blogForm.addEventListener('submit', (e) => {
        //     e.preventDefault();
            
        //     // Collect form data
        //     blogData.title = document.getElementById('title').value;
        //     blogData.category = document.getElementById('category').value;
        //     blogData.content = contentTextarea.value;
            
        //     if (!blogData.title || !blogData.category || !blogData.content) {
        //         alert('Please fill in all required fields');
        //         return;
        //     }
            
        //     // Simulate blog post creation
        //     console.log('Publishing blog post:', blogData);

            

        //     alert('🎉 Blog post published successfully!');
            
        //     // Reset form (optional)
        //     // resetForm();
        // });

        // Save as draft
        document.getElementById('saveDraft').addEventListener('click', () => {
            blogData.title = document.getElementById('title').value;
            blogData.category = document.getElementById('category').value;
            blogData.content = contentTextarea.value;
            
            console.log('Saving draft:', blogData);
            alert('💾 Draft saved successfully!');
        });

        function resetForm() {
            blogForm.reset();
            imagePreview.style.display = 'none';
            blogData = { title: '', category: '', content: '', image: null, tags: [] };
            renderTags();
            wordCount.textContent = '0 words';
        }

        // Auto-save functionality (optional)
        let autoSaveTimer;
        function startAutoSave() {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => {
                // Auto-save logic here
                console.log('Auto-saving...');
            }, 30000); // Auto-save every 30 seconds
        }

        // Start auto-save when user starts typing
        ['title', 'content'].forEach(id => {
            document.getElementById(id).addEventListener('input', startAutoSave);
        });