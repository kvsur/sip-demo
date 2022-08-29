this.session.delegate = {
            onSessionDescriptionHandler: (sdh) => {
                setTimeout(() => {
                    this.setupLocalMedia();
                    this.setupRemoteMedia();
                }, 0);
            },