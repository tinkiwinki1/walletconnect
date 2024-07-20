import { SignClient } from '@walletconnect/sign-client';

document.addEventListener('DOMContentLoaded', async () => {
    const connectButton = document.getElementById('connect-button');
    const statusMessage = document.getElementById('status-message');
    const modal = document.getElementById('myModal');
    const span = document.getElementsByClassName('close')[0];
    const qrCodeContainer = document.getElementById('qrcode');

    let signClient;

    try {
        signClient = await SignClient.init({
            projectId: '4d63cbda1c61e149111331eebc34f837',
            relayUrl: 'wss://relay.walletconnect.org',
            metadata: {
                name: 'Your DApp',
                description: 'Description of your DApp',
                url: 'https://your-dapp.com',
                icons: ['https://your-dapp.com/icon.png']
            }
        });

        console.log('SignClient initialized:', signClient);

        signClient.on('session_proposal', async (proposal) => {
            console.log('Session Proposal:', proposal);
            const { id, params } = proposal;
            const { requiredNamespaces } = params;

            const namespaces = {};
            Object.keys(requiredNamespaces).forEach(key => {
                namespaces[key] = {
                    accounts: ['eip155:1:0x0...'], // Укажите адреса, которые вы хотите использовать
                    methods: requiredNamespaces[key].methods,
                    events: requiredNamespaces[key].events,
                };
            });

            await signClient.approve({
                id,
                namespaces,
            });

            modal.style.display = 'none';
            const connectedAddress = namespaces.eip155.accounts[0].split(':')[2];
            statusMessage.textContent = `Connected address: ${connectedAddress}`;
        });

        signClient.on('session_event', event => {
            console.log('Session Event:', event);
        });

        signClient.on('session_request', event => {
            console.log('Session Request:', event);
        });

        signClient.on('session_ping', event => {
            console.log('Session Ping:', event);
        });

        signClient.on('session_delete', event => {
            console.log('Session Delete:', event);
        });
    } catch (error) {
        console.error('Error initializing SignClient:', error);
        statusMessage.textContent = 'Error initializing SignClient. Please try again.';
    }

    connectButton.addEventListener('click', async () => {
        try {
            console.log('Connecting...');
            statusMessage.textContent = 'Connecting...';
            const { uri } = await signClient.connect({
                requiredNamespaces: {
                    eip155: {
                        methods: ['eth_sendTransaction', 'personal_sign'],
                        chains: ['eip155:1'],
                        events: ['accountsChanged']
                    }
                }
            });

            if (uri) {
                console.log('Opening modal with URI:', uri);
                statusMessage.textContent = 'Opening modal...';

                // Открытие модального окна с QR-кодом
                modal.style.display = 'block';
                qrCodeContainer.innerHTML = '';
                new QRCode(qrCodeContainer, uri);
            } else {
                console.error('No URI received');
                statusMessage.textContent = 'Failed to get URI. Please try again.';
            }
        } catch (error) {
            console.error('Error during connection:', error);
            statusMessage.textContent = 'Error during connection. Please try again.';
        }
    });

    // Закрытие модального окна
    span.onclick = function () {
        modal.style.display = 'none';
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
});
