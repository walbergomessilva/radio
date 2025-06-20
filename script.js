// script.js
document.addEventListener('DOMContentLoaded', () => {
    const artistElement = document.querySelector('.current-artist');
    const titleElement = document.querySelector('.current-title');
    const songInfoElement = document.querySelector('.song-info-fixed');
    const audioElement = document.getElementById('radio-audio');

    // ##################################################################
    // !!! MUITO IMPORTANTE: ATUALIZE ESTE LINK COM SEU NGrok ATUAL !!!
    // Se o Ngrok for reiniciado, este link MUDARÁ!
    // Ele deve ser o link BASE do Ngrok (sem /radio ou /status-json.xsl)
    // Ex: https://882a-2804-29b8-50d7-74f4-657b-4eaf-66ff-c814.ngrok-free.app
    // ##################################################################
    const statusHtmlUrl = 'https://f058-2804-29b8-50d7-74f4-dbb5-457e-a941-9b3e.ngrok-free.app';

    let currentArtist = '';
    let currentTitle = '';

    function updateSongInfo() {
        fetch(statusHtmlUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text(); // Pedir como TEXTO, pois é HTML
            })
            .then(htmlString => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlString, 'text/html');

                let fullTitle = '';
                // Tenta encontrar o texto "Currently playing:" na tabela de status do Icecast
                // Procuramos por uma célula que contém "Currently playing:" e pegamos o texto da célula seguinte.
                const tableRows = doc.querySelectorAll('table.responsivetable tr'); // Tenta encontrar a tabela com essa classe
                for (const row of tableRows) {
                    const cells = row.querySelectorAll('td');
                    if (cells.length >= 2 && cells[0].textContent.trim() === 'Currently playing:') {
                        fullTitle = cells[1].textContent.trim();
                        break;
                    }
                }

                if (fullTitle && fullTitle !== 'N/A' && fullTitle !== '') { // Verifica se há título válido
                    let artist = ''; // Começa vazio
                    let title = fullTitle;

                    const parts = fullTitle.split(' - ');
                    if (parts.length >= 2) {
                        artist = parts[0].trim();
                        title = parts.slice(1).join(' - ').trim(); // Junta o resto se houver múltiplos "-"
                    } else {
                        // Se não encontrar o "-", todo o título é a música, e o artista fica vazio
                        artist = ''; // Deixe vazio para não mostrar "Artista Desconhecido"
                        title = fullTitle.trim();
                    }

                    // Apenas atualiza se a música ou artista mudou para evitar piscar desnecessário
                    if (artist !== currentArtist || title !== currentTitle) {
                        songInfoElement.classList.remove('visible'); // Inicia o fade-out

                        setTimeout(() => {
                            artistElement.textContent = artist;
                            titleElement.textContent = title;
                            songInfoElement.classList.add('visible'); // Inicia o fade-in

                            currentArtist = artist;
                            currentTitle = title;
                        }, 500); // Duração do fade (0.5s)
                    }
                } else {
                    // Se não houver 'Currently playing' ou for "N/A" (sem música tocando), limpa o texto
                    if (currentArtist !== '' || currentTitle !== '') {
                        songInfoElement.classList.remove('visible');
                        setTimeout(() => {
                            artistElement.textContent = '';
                            titleElement.textContent = '';
                            currentArtist = '';
                            currentTitle = '';
                        }, 500);
                    }
                }
            })
            .catch(error => {
                console.error('Erro ao buscar informações da música:', error);
                songInfoElement.classList.remove('visible'); // Esconde o texto para mostrar o erro
                setTimeout(() => {
                    artistElement.textContent = 'Erro na Conexão';
                    titleElement.textContent = 'Verifique sua internet e o Icecast';
                    songInfoElement.classList.add('visible');
                    // Atualiza currentArtist/Title para o texto de erro, para não ficar piscando
                    currentArtist = 'Erro na Conexão';
                    currentTitle = 'Verifique sua internet e o Icecast';
                }, 500);
            });
    }

    // Chama a função ao carregar a página e repete a cada 5 segundos
    updateSongInfo();
    setInterval(updateSongInfo, 5000);
});
