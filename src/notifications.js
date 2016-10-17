'use strict';

/*
 global window,
 document
 */

module.exports = function() {
  const notificationModule = function() {
  };

  notificationModule.options = {
    dismissAfter: 4000
  };

  notificationModule.prototype = {
    constructor: notificationModule
  };

  /**
   * Creates a new notification
   *
   * @param {string} type                  the notification type: one of
   *                                        - info
   *                                        - success
   *                                        - warning
   *                                        - error
   *                                        - confirmation
   * @param {string} message               the notification message to display
   * @param {Array} [actions]              an optional options object containing interaction options
   *                                       for the notification. This can be between 0 and 2 actions
   *                                       in the following format:
   *                                       { name: 'Button label', action: function(){} }
   */
  notificationModule.prototype.create = function(type, message, actions) {
    let availableNotificationTypes = [
          'info',
          'success',
          'warning',
          'error',
          'confirmation'
        ],
        actionContext              = this,
        dismissAfter               = notificationModule.options.dismissAfter;

    // check whether the notification type is known
    if (availableNotificationTypes.indexOf(type) === -1) {
      return console.error(new Error('The notification type ' + type + ' is not available.'));
    }

    // set empty actions Array
    actions = actions || [];

    let domNode       = document.createElement('div');
    domNode.className = 'notification ' + type;

    let messageNode       = document.createElement('span');
    messageNode.className = 'message';
    messageNode.appendChild(document.createTextNode(message));

    domNode.appendChild(messageNode);

    if (actions.length > 0) {
      for (let i = 0; i < actions.length; i++) {
        let data         = actions[ i ],
            actionId     = this.createId(8),
            actionButton = document.createElement('button');

        actionButton.className        = 'action';
        actionButton.dataset.actionId = actionId;
        actionButton.appendChild(document.createTextNode(data.name));
        domNode.appendChild(actionButton);

        actionButton.addEventListener('click', function(data) {
          data.action.call(this, domNode);

          domNode.classList.remove('visible');

          setTimeout(function() {
            domNode.remove();
            document.dispatchEvent(new Event('notifications:removed'));
          }, 200);
        }.bind(actionContext, data));
      }
    }


    /**
     * move previous notifications further up on the page
     * to make space for the new notification
     *
     * @type {NodeList}
     */
    let notificationItems = document.getElementsByClassName('notification');
    if (notificationItems.length) {
      for (let i = 0; i < notificationItems.length; i++) {
        let notificationHeight = notificationItems[ i ].getBoundingClientRect().height;
        notificationItems[ i ].style.bottom = Math.round(((i + 1) * notificationHeight + (notificationHeight / 4))) + 'px';
      }
    }


    /**
     * append notification to document
     */
    document.getElementsByTagName('body')[ 0 ].appendChild(domNode);
    domNode.classList.add('visible');

    if (type !== 'confirmation') {
      domNode.dismissTimer = setTimeout(function() {
        domNode.classList.remove('visible');

        setTimeout(function() {
          domNode.remove();
          document.dispatchEvent(new Event('notifications:removed'));
        }, 200);
      }, notificationModule.options.dismissAfter);
    }


    domNode.addEventListener('mouseenter', function() {
      if (type !== 'confirmation') {
        clearTimeout(domNode.dismissTimer);
      }
    });


    /**
     * restart automatic removal if the mouse leaves the notification
     */
    domNode.addEventListener('mouseleave', function() {
      if (type !== 'confirmation') {
        const dismissTimeout = function() {
          return setTimeout(function() {
            domNode.classList.remove('visible');

            setTimeout(function() {
              domNode.remove();
              document.dispatchEvent(new Event('notifications:removed'));
            }, 200);
          }, notificationModule.options.dismissAfter);
        };

        domNode.dismissTimer = dismissTimeout()
      }
    });
  };


  /**
   * wrapper for info notifications
   *
   * @param message
   * @param options
   */
  notificationModule.prototype.info = function(message, options) {
    return this.create('info', message, options);
  };


  /**
   * wrapper for success notifications
   *
   * @param message
   * @param options
   */
  notificationModule.prototype.success = function(message, options) {
    return this.create('success', message, options);
  };


  /**
   * wrapper for warning notifications
   *
   * @param message
   * @param options
   */
  notificationModule.prototype.warning = function(message, options) {
    return this.create('warning', message, options);
  };


  /**
   * wrapper for error notifications
   *
   * @param message
   * @param options
   */
  notificationModule.prototype.error = function(message, options) {
    return this.create('error', message, options);
  };


  /**
   * wrapper for confirmation notifications
   *
   * @param message
   * @param options
   */
  notificationModule.prototype.confirmation = function(message, options) {
    return this.create('confirmation', message, options);
  };


  notificationModule.prototype.createId = function(count) {
    const result   = '',
          possible = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for (let i = 0; i < count; i++) {
      result += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return result;
  };


  return new notificationModule();
};
