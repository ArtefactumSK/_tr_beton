jQuery(document).ready(function ($) {
    const originalMediaFrame = wp.media.view.MediaFrame.Select;

    wp.media.view.MediaFrame.Select = originalMediaFrame.extend({
        initialize: function () {
            originalMediaFrame.prototype.initialize.apply(this, arguments);

            this.on('content:render:insert', this.addInsertUrlTab, this);
        },

        addInsertUrlTab: function () {
            const frame = this;

            if (!this.$el.find('#trbeton-insert-url-tab').length) {
                // Pridať vlastný tab do menu
                this.$el.find('.media-menu').append('<a href="#" class="media-menu-item" id="trbeton-insert-url-tab">Vložiť z URL</a>');

                // Obsah pre tab
                this.content.set('insert-url', new wp.media.view.View({
                    className: 'trbeton-insert-url-content',
                    ready: function () {
                        this.$el.html(
                            '<div style="padding: 20px;">' +
                            '<label for="trbeton-url-input">URL obrázka:</label><br>' +
                            '<input type="text" id="trbeton-url-input" style="width: 100%; padding: 6px; margin: 10px 0;" />' +
                            '<button class="button button-primary" id="trbeton-url-insert">Vložiť obrázok</button>' +
                            '</div>'
                        );
                    }
                }));

                // Zmena tabu
                this.$el.on('click', '#trbeton-insert-url-tab', function (e) {
                    e.preventDefault();
                    frame.content.mode('insert-url');
                    frame.$el.find('.media-menu-item').removeClass('active');
                    $(this).addClass('active');
                });

                // Po kliknutí na "Vložiť obrázok"
                this.$el.on('click', '#trbeton-url-insert', function (e) {
                    e.preventDefault();
                    const imageUrl = $('#trbeton-url-input').val().trim();
                    if (imageUrl) {
                        const attachment = {
                            id: null,
                            url: imageUrl,
                            type: 'image',
                            subtype: 'jpeg',
                            title: 'Externý obrázok'
                        };

                        // Simuluj výber obrázka
                        frame.state().get('selection').reset([new wp.media.model.Attachment(attachment)]);
                        frame.close();
                    }
                });
            }
        }
    });
});
