/// <reference path="qr.ts" />
/// <reference path="imageexpansion.ts" />
/// <reference path="watcher.ts" />
/// <reference path="watchinterface.ts" />
/// <reference path="persistence.ts" />

module uchan {
    export const context = {
        mode: null as string,
        boardName: null as string,
        postEndpoint: null as string,
        filePostingEnabled: false,
        fileMax: null as number,
        threadRefno: null as number,
        locked: false,
        sticky: false,

        persistence: null as Persistence,
        qr: null as QR
    };

    export const escape = function(text) {
        text = text.toString();
        text = text.replace('&', '&amp;');
        text = text.replace('>', '&gt;');
        text = text.replace('<', '&lt;');
        text = text.replace("'", '&#39;');
        text = text.replace('"', '&#34;');
        return text;
    };

    export const lpad = function(str, len, fill) {
        str = str.toString();
        while (str.length < len) {
            str = fill + str;
        }
        return str;
    };

    export const round = function(num, digits) {
        let i = Math.pow(10, digits);
        return Math.round(num * i) / i;
    };

    export const xhrJsonGet = function(endpoint: string, callback: (error: Error, data: any) => void) {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', endpoint);
        xhr.send(null);
        xhr.onload = function(event) {
            if (xhr.status == 200) {
                let jsonData = null;
                let e: Error = null;
                try {
                    jsonData = JSON.parse(xhr.responseText);
                } catch (err) {
                    e = err;
                }

                if (jsonData != null) {
                    callback(null, jsonData);
                } else {
                    callback(e, null);
                }
            } else {
                xhr.onerror(<ErrorEvent> event);
            }
        };
        xhr.onerror = function(event) {
            callback(new Error(event.type), null);
        };
        return xhr;
    };

    const init = function() {
        let pageDetails = window['pageDetails'];
        if (!pageDetails) {
            console.error('window.pageDetails not defined');
        } else {
            context.mode = pageDetails.mode;
            context.boardName = pageDetails.boardName;
            context.postEndpoint = pageDetails.postEndpoint;
            context.filePostingEnabled = pageDetails.filePostingEnabled || false;
            context.fileMax = pageDetails.fileMax || null;
            context.threadRefno = pageDetails.threadRefno || null;
            context.locked = pageDetails.locked || false;
            context.sticky = pageDetails.sticky || false;

            context.persistence = new Persistence();

            let linkListRight = document.querySelector('.top-bar-right');
            linkListRight.innerHTML = '[<a id="open-watches" href="javascript:void(0)">bookmarks</a>] ' + linkListRight.innerHTML;
            let openWatches = linkListRight.querySelector('#open-watches');
            let watchInterface = new WatchInterface(context.persistence, openWatches);

            let threadControls = document.querySelectorAll('.thread-controls .thread-controls-extra');
            let threadControlsRight = document.querySelectorAll('.thread-controls .thread-controls-right');
            let openQrControls: HTMLElement[] = [];
            let watchThreadControls: HTMLElement[] = [];
            let watchUpdateControls: HTMLElement[] = [];
            let watchStatusElements: HTMLElement[] = [];

            if (context.mode == 'thread') {
                for (let i = 0; i < threadControls.length; i++) {
                    let addOpenQr = i == threadControls.length - 1;

                    let threadControl = threadControls[i];
                    threadControl.innerHTML += ' [<a class="watch-thread" href="javascript:void(0)">Watch thread</a>]' +
                        ' [<a class="watch-update" href="javascript:void(0)">Update</a>] <span class="watch-status"></span>';

                    let threadControlRight;
                    if (addOpenQr) {
                        threadControlRight = threadControlsRight[i];
                        threadControlRight.innerHTML += '[<a class="open-qr" href="javascript:void(0)">Reply</a>]';
                    }

                    if (addOpenQr) {
                        openQrControls.push(<HTMLElement>threadControlRight.querySelector('.open-qr'));
                    }
                    watchThreadControls.push(<HTMLElement>threadControl.querySelector('.watch-thread'));
                    watchUpdateControls.push(<HTMLElement>threadControl.querySelector('.watch-update'));
                    watchStatusElements.push(<HTMLElement>threadControl.querySelector('.watch-status'));
                }

                for (let i = 0; i < watchThreadControls.length; i++) {
                    let watchThreadControl = watchThreadControls[i];
                    watchThreadControl.addEventListener('click', function(e) {
                        e.preventDefault();
                        watchInterface.watchThis();
                    });
                }
            }

            let imageExpansion = new ImageExpansion();
            imageExpansion.bindImages();

            if (context.mode == 'thread' && !context.locked) {
                let postForm = <HTMLElement>document.querySelector('.post-form');
                postForm.style.display = 'none';

                let postsElement = document.querySelector('.posts');
                let watcher = new Watcher(context.boardName, context.threadRefno, postsElement, watchStatusElements, imageExpansion);
                let posts = <NodeListOf<HTMLElement>>postsElement.querySelectorAll('.post');
                watcher.bindPosts(posts);

                context.qr = new QR(watcher);
                for (let i = 0; i < openQrControls.length; i++) {
                    context.qr.addShowClickListener(openQrControls[i]);
                }
                for (let i = 0; i < watchUpdateControls.length; i++) {
                    watcher.addUpdateListener(watchUpdateControls[i]);
                }
                watcher.bindRefnos();
            }
        }
    };

    init();
}
