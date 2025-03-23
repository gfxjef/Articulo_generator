// Inicializar el editor Quill con opciones mejoradas
const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
        toolbar: [
            // Eliminado el selector de headers/encabezados
            ['bold', 'italic', 'underline', 'strike'],
            ['link', 'image'],
            [{ 'size': ['10pt', '12pt', '14pt', '16pt', '18pt', '20pt', '24pt', '36pt'] }], // Tamaños basados en pts
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['blockquote'],
            ['clean']
        ]
    },
    placeholder: 'Comienza a escribir tu artículo aquí...'
});

// Personalizar el manejo de tamaños de fuente en pts
const Size = Quill.import('attributors/style/size');
Size.whitelist = ['10pt', '12pt', '14pt', '16pt', '18pt', '20pt', '24pt', '36pt'];
Quill.register(Size, true);

// Función mejorada para modificar las etiquetas del dropdown de tamaño
function fixSizeDropdown() {
    // Obtener todos los elementos picker-item dentro del dropdown de tamaño
    const sizePickerItems = document.querySelectorAll('.ql-size .ql-picker-item');
    const sizePickerLabel = document.querySelector('.ql-size .ql-picker-label');
    
    if (sizePickerItems.length > 0) {
        // Actualizar cada elemento del dropdown
        sizePickerItems.forEach(item => {
            // Obtener el valor almacenado en el atributo data-value
            const size = item.getAttribute('data-value');
            
            // Limpiar cualquier texto existente y establecer solo el valor en pts
            item.textContent = size;
            
            // También modificar el atributo title que muestra el texto en hover
            item.setAttribute('title', size);
        });
        
        // También modificar el label cuando tiene un valor seleccionado
        if (sizePickerLabel) {
            const currentValue = sizePickerLabel.getAttribute('data-value');
            if (currentValue) {
                // Quitar cualquier texto adicional del elemento visible
                const labelChild = sizePickerLabel.querySelector('.ql-picker-label-text');
                if (labelChild) {
                    labelChild.textContent = currentValue;
                } else {
                    // Si no existe el elemento interno específico, crear un span para el texto limpio
                    const span = document.createElement('span');
                    span.className = 'ql-picker-label-text';
                    span.textContent = currentValue;
                    // Limpiar el contenido existente y agregar solo nuestro span
                    sizePickerLabel.innerHTML = '';
                    sizePickerLabel.appendChild(span);
                    // Volver a agregar el ícono SVG para el dropdown
                    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    svg.setAttribute('viewBox', '0 0 18 18');
                    
                    // Crear los polígonos para las flechas del dropdown
                    const poly1 = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                    poly1.setAttribute('class', 'ql-stroke');
                    poly1.setAttribute('points', '7 11 9 13 11 11 7 11');
                    
                    const poly2 = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                    poly2.setAttribute('class', 'ql-stroke');
                    poly2.setAttribute('points', '7 7 9 5 11 7 7 7');
                    
                    svg.appendChild(poly1);
                    svg.appendChild(poly2);
                    sizePickerLabel.appendChild(svg);
                }
            }
        }
        
        // Añadir un observador para detectar cambios en el selector
        if (!window.sizeObserver && sizePickerLabel) {
            window.sizeObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'data-value') {
                        const newValue = sizePickerLabel.getAttribute('data-value');
                        if (newValue) {
                            const labelChild = sizePickerLabel.querySelector('.ql-picker-label-text');
                            if (labelChild) {
                                labelChild.textContent = newValue;
                            }
                        }
                    }
                });
            });
            
            window.sizeObserver.observe(sizePickerLabel, { attributes: true });
        }
        
        console.log('Size dropdown items updated successfully!');
        return true;
    } else {
        // Si aún no encontramos los elementos, intentar de nuevo
        console.log('Size dropdown items not found, retrying...');
        return false;
    }
}

// Función para asegurar que el dropdown se actualice incluso después de interacciones del usuario
function setupSizeDropdownObserver() {
    // Primero intentamos actualizar inmediatamente
    let success = fixSizeDropdown();
    
    if (!success) {
        // Si no funciona, intentamos varias veces con intervalos crecientes
        let attempts = 0;
        const maxAttempts = 10;
        const interval = setInterval(() => {
            success = fixSizeDropdown();
            attempts++;
            
            if (success || attempts >= maxAttempts) {
                clearInterval(interval);
            }
        }, 200); // Intentar cada 200ms
    }
    
    // Actualizar también cuando cambie la selección de tamaño
    const sizePickerLabel = document.querySelector('.ql-size .ql-picker-label');
    if (sizePickerLabel) {
        // Cuando el dropdown se abra, asegurar que los textos estén actualizados
        sizePickerLabel.addEventListener('click', () => {
            setTimeout(fixSizeDropdown, 10);
        });
    }
}

// Sobrescribir el método que Quill usa para formatear sus etiquetas
// Esta es una solución más directa para evitar que Quill añada "Normal" a los textos
document.addEventListener('DOMContentLoaded', () => {
    // Dar tiempo a Quill para inicializarse completamente
    setTimeout(() => {
        // Obtener todas las hojas de estilo del documento para insertar un estilo personalizado
        const style = document.createElement('style');
        style.innerHTML = `
            /* Ocultar el texto predeterminado "Normal" que añade Quill */
            .ql-picker-label::before {
                content: none !important;
            }
            .ql-picker-item::before {
                content: none !important;
            }
            
            /* Asegurar que nuestro texto personalizado sea visible */
            .ql-picker-label-text {
                display: inline-block !important;
                font-size: 14px;
            }
        `;
        document.head.appendChild(style);
        
        // Iniciar el observer
        setupSizeDropdownObserver();
    }, 500);
});

// Iniciar después de que la página esté cargada
document.addEventListener('DOMContentLoaded', () => {
    // Dar tiempo a Quill para inicializarse completamente
    setTimeout(setupSizeDropdownObserver, 500);
});

// Referencias a elementos DOM
const saveBtn = document.getElementById('saveBtn');
const newBtn = document.getElementById('newBtn');
const addImageBtn = document.getElementById('add-image');
const addLinkBtn = document.getElementById('add-link');
const titleInput = document.getElementById('article-title');
const savedArticlesList = document.getElementById('saved-articles');

// Referencias modales
const imageModal = document.getElementById('image-modal');
const linkModal = document.getElementById('link-modal');
const closeButtons = document.querySelectorAll('.close');
const imagePreview = document.getElementById('image-preview');
const imageUrlInput = document.getElementById('image-url');
const imageUpload = document.getElementById('image-upload');
const insertImageBtn = document.getElementById('insert-image');
const linkTextInput = document.getElementById('link-text');
const linkUrlInput = document.getElementById('link-url');
const insertLinkBtn = document.getElementById('insert-link');

// Estado de la aplicación
let currentArticleId = null;
let articles = JSON.parse(localStorage.getItem('articles')) || [];

// Inicialización
function init() {
    renderSavedArticles();
    
    // Verificar si hay un artículo en edición
    const lastEditedArticle = localStorage.getItem('lastEditedArticle');
    if (lastEditedArticle) {
        loadArticle(JSON.parse(lastEditedArticle));
    }
    
    // Agregar handlers para los botones del toolbar de Quill
    const imageButton = document.querySelector('.ql-image');
    const linkButton = document.querySelector('.ql-link');
    
    if (imageButton) {
        // Reemplazar el comportamiento por defecto
        imageButton.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(imageModal);
            imageUrlInput.value = '';
            imageUpload.value = '';
            imagePreview.style.display = 'none';
            imagePreview.src = '';
        });
    }
    
    if (linkButton) {
        // Reemplazar el comportamiento por defecto
        linkButton.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(linkModal);
            linkTextInput.value = '';
            linkUrlInput.value = '';
            
            // Obtener texto seleccionado
            const range = quill.getSelection();
            if (range && range.length > 0) {
                const text = quill.getText(range.index, range.length);
                linkTextInput.value = text;
            }
        });
    }
    
    // Solución mejorada para eliminar el placeholder al hacer foco o clic en el editor
    setupPlaceholderRemoval();
}

// Nueva función dedicada para manejar correctamente el placeholder
function setupPlaceholderRemoval() {
    // Esperar a que el editor esté completamente cargado
    setTimeout(() => {
        const editorElement = document.querySelector('.ql-editor');
        
        if (editorElement) {
            // Limpiar al hacer clic
            editorElement.addEventListener('click', clearPlaceholderIfNeeded);
            
            // También limpiar al hacer foco con teclado
            editorElement.addEventListener('focus', clearPlaceholderIfNeeded);
            
            // También al comenzar a escribir directamente
            editorElement.addEventListener('keydown', (e) => {
                // Solo para teclas que insertan caracteres (no para navegación, etc.)
                if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
                    clearPlaceholderIfNeeded();
                }
            });
            
            console.log('Placeholder removal handlers added successfully');
        } else {
            console.log('Editor element not found, retrying...');
            // Si no encontramos el editor, intentar de nuevo
            setTimeout(setupPlaceholderRemoval, 200);
        }
    }, 300);
}

// Función para verificar y limpiar el placeholder si es necesario
function clearPlaceholderIfNeeded() {
    const editorContent = quill.getText().trim();
    const placeholderText = 'Comienza a escribir tu artículo aquí...';
    
    // Verificar si el contenido actual es solo el placeholder
    if (editorContent === placeholderText) {
        console.log('Clearing placeholder text');
        // Limpiar el editor por completo
        quill.setText('');
    }
}

// Guardar artículo
saveBtn.addEventListener('click', () => {
    const title = titleInput.value.trim();
    if (!title) {
        alert('Por favor, añade un título a tu artículo');
        return;
    }
    
    const content = quill.root.innerHTML;
    const date = new Date().toLocaleString();
    
    if (currentArticleId) {
        // Actualizar artículo existente
        const index = articles.findIndex(a => a.id === currentArticleId);
        if (index !== -1) {
            articles[index] = {
                ...articles[index],
                title,
                content,
                lastModified: date
            };
        }
    } else {
        // Crear nuevo artículo
        const newArticle = {
            id: Date.now().toString(),
            title,
            content,
            created: date,
            lastModified: date
        };
        
        articles.push(newArticle);
        currentArticleId = newArticle.id;
    }
    
    // Guardar en localStorage
    localStorage.setItem('articles', JSON.stringify(articles));
    localStorage.setItem('lastEditedArticle', JSON.stringify({
        id: currentArticleId,
        title,
        content
    }));
    
    renderSavedArticles();
    
    alert('Artículo guardado correctamente');
});

// Crear nuevo artículo
newBtn.addEventListener('click', () => {
    if (confirm('¿Estás seguro de crear un nuevo artículo? Los cambios no guardados se perderán.')) {
        titleInput.value = '';
        quill.root.innerHTML = '';
        currentArticleId = null;
        localStorage.removeItem('lastEditedArticle');
    }
});

// Renderizar lista de artículos
function renderSavedArticles() {
    savedArticlesList.innerHTML = '';
    
    if (articles.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.textContent = 'No hay artículos guardados';
        savedArticlesList.appendChild(emptyMessage);
        return;
    }
    
    articles.forEach(article => {
        const li = document.createElement('li');
        li.textContent = article.title;
        li.dataset.id = article.id;
        li.addEventListener('click', () => {
            if (confirm('¿Quieres cargar este artículo? Los cambios no guardados se perderán.')) {
                loadArticle(article);
            }
        });
        savedArticlesList.appendChild(li);
    });
}

// Cargar artículo
function loadArticle(article) {
    titleInput.value = article.title || '';
    quill.root.innerHTML = article.content || '';
    currentArticleId = article.id;
    
    // Guardar último artículo editado
    localStorage.setItem('lastEditedArticle', JSON.stringify({
        id: article.id,
        title: article.title,
        content: article.content
    }));
}

// Funcionalidad de modal de imagen
/*
addImageBtn.addEventListener('click', () => {
    openModal(imageModal);
    imageUrlInput.value = '';
    imageUpload.value = '';
    imagePreview.style.display = 'none';
    imagePreview.src = '';
});
*/

// Previsualizar imagen
imageUrlInput.addEventListener('input', () => {
    const url = imageUrlInput.value.trim();
    if (url) {
        imagePreview.src = url;
        imagePreview.style.display = 'block';
    } else {
        imagePreview.style.display = 'none';
    }
});

// Subir imagen desde el dispositivo
imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            imagePreview.src = event.target.result;
            imagePreview.style.display = 'block';
            // Al subir una imagen, borramos la URL
            imageUrlInput.value = '';
        };
        reader.readAsDataURL(file);
    }
});

// Insertar imagen con control de tamaño
insertImageBtn.addEventListener('click', () => {
    let imageUrl = imageUrlInput.value.trim();
    
    // Si hay una imagen cargada desde el dispositivo
    if (imageUpload.files.length > 0 && !imageUrl) {
        imageUrl = imagePreview.src;
    }
    
    if (!imageUrl) {
        alert('Por favor, proporciona una URL de imagen o sube una desde tu dispositivo');
        return;
    }
    
    const range = quill.getSelection(true);
    
    // Insertar imagen y luego aplicar clase para control de tamaño
    quill.insertEmbed(range.index, 'image', imageUrl, 'user');
    
    // Aplicar formato para asegurar que la imagen esté dentro del ancho máximo
    setTimeout(() => {
        const imgElements = quill.root.querySelectorAll('img');
        imgElements.forEach(img => {
            // Las imágenes mantendrán su tamaño original hasta 600px
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
        });
    }, 10);
    
    quill.setSelection(range.index + 1);
    
    closeModal(imageModal);
});

// Funcionalidad de modal de enlace
/*
addLinkBtn.addEventListener('click', () => {
    openModal(linkModal);
    linkTextInput.value = '';
    linkUrlInput.value = '';
    
    // Obtener texto seleccionado
    const range = quill.getSelection();
    if (range && range.length > 0) {
        const text = quill.getText(range.index, range.length);
        linkTextInput.value = text;
    }
});
*/

// Insertar enlace
insertLinkBtn.addEventListener('click', () => {
    const text = linkTextInput.value.trim();
    const url = linkUrlInput.value.trim();
    
    if (!text || !url) {
        alert('Por favor, completa todos los campos');
        return;
    }
    
    const range = quill.getSelection(true);
    
    // Si hay texto seleccionado, reemplazarlo con el enlace
    if (range.length > 0) {
        quill.deleteText(range.index, range.length);
    }
    
    // Insertar enlace
    quill.insertText(range.index, text, 'link', url);
    quill.setSelection(range.index + text.length);
    
    closeModal(linkModal);
});

// Funciones para manejar modales
function openModal(modal) {
    modal.style.display = 'flex';
}

function closeModal(modal) {
    modal.style.display = 'none';
}

// Cerrar modales al hacer clic en el botón de cerrar
closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        closeModal(modal);
    });
});

// Cerrar modales al hacer clic fuera del contenido
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target);
    }
});

// Inicializar la aplicación
init();