document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.popup');
    const modal = document.getElementById('customModal');
    const modalHeader = document.getElementById('modalHeader');
    const modalBody = document.getElementById('modalBody');
    const modalFooter = document.getElementById('modalFooter');
    const closeModal = document.querySelector('.close');
    // const speedSlider = document.getElementById('speedSlider');
    // const modalSlider = document.getElementById('modalSlider');
    let iframeElement = null;

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            cells.forEach(cell => {
                cell.addEventListener('click', () => {
                    const key = cell.getAttribute('data-key');
                    const content = data[key];
                    
                    // Clear previous modal content
                    modalHeader.innerHTML = '';
                    modalBody.innerHTML = '';
                    modalFooter.innerHTML = ''; // Clear footer content
                    // modalSlider.style.display = 'none'; // Hide the slider by default

                    // Set the header
                    const headerElement = document.createElement('h2');
                    headerElement.textContent = content.title;
                    modalHeader.appendChild(headerElement);

                    // Handle Video Content
                    if (content.video) {
                        iframeElement = document.createElement('iframe');
                        iframeElement.setAttribute('src', content.video);
                        iframeElement.setAttribute('frameborder', '0');
                        iframeElement.setAttribute('allow', 'autoplay; encrypted-media');
                        iframeElement.setAttribute('allowfullscreen', '');
                        modalBody.appendChild(iframeElement);
                    }

                    // Handle Image Content (display images side-by-side)
                    const imagesContainer = document.createElement('div');
                    imagesContainer.classList.add('images');
                    if (content.images.length > 0) {
                        content.images.forEach(image => {
                            const imgElement = document.createElement('img');
                            imgElement.setAttribute('src', image);
                            imgElement.setAttribute('alt', 'Image content');
                            imagesContainer.appendChild(imgElement);
                        });
                    }
                    modalFooter.appendChild(imagesContainer);

                    // Handle Text Content (text will be below images)
                    if (content.text) {
                        const textElement = document.createElement('p');
                        textElement.innerHTML = content.text;  // Use innerHTML to allow links and HTML tags
                        const textContainer = document.createElement('div');
                        textContainer.classList.add('text');
                        textContainer.appendChild(textElement);
                        modalFooter.appendChild(textContainer);
                    }

                    modal.style.display = 'flex';
                });
            });
        });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        if (iframeElement) {
            iframeElement.setAttribute('src', ''); // Stop the iframe video when the modal is closed
        }
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            if (iframeElement) {
                iframeElement.setAttribute('src', ''); // Stop the iframe video when clicking outside the modal
            }
        }
    });
});