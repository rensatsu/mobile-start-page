'use strict';

import './styles/app.scss';
import App from './js/app';
import Message from './js/message';

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('no-js')) {
        document.getElementById('no-js').hidden = true;
    }

    new App('main');

    if ('serviceWorker' in navigator) {
        console.info('[worker]', 'registration start');
        navigator.serviceWorker.register('service-worker.js', {
            scope: location.pathname
        })
            .then(reg => {
                console.info('[worker]', 'registration completed');

                reg.addEventListener('updatefound', () => {
                    const installingWorker = reg.installing;

                    installingWorker.addEventListener('statechange', () => {
                        switch (installingWorker.state) {
                            case 'installed':
                                if (navigator.serviceWorker.controller) {
                                    // At this point, the old content will have been purged and the fresh content will
                                    // have been added to the cache.
                                    // It's the perfect time to display a "New content is available; please refresh."
                                    // message in the page's interface.
                                    new Message('App update available, please reload page');
                                    console.info('[worker]', 'new or updated content is available');
                                } else {
                                    // At this point, everything has been precached.
                                    // It's the perfect time to display a "Content is cached for offline use." message.
                                    new Message('App is ready to be used offline');
                                    console.info('[worker]', 'content is now available offline');
                                }
                                break;

                            case 'waiting':
                                console.log('[worker]', 'waiting state');
                                break;
                            case 'redundant':
                                console.error('[worker]', 'the installing service worker became redundant');
                                break;
                        }
                    });
                });
            })
            .catch(e => {
                console.error('[worker]', 'registration failed', e);
            });
    }
});
