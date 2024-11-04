// public/service-worker.js
/* eslint-disable no-restricted-globals */
/* global clients */


self.addEventListener('push', function(event) {
    let data = {};
  
    if (event.data) {
      try {
        data = event.data.json();
        console.log('Push received:', data);
      } catch (error) {
        console.error('Push data parsing error:', error);
      }
    } else {
      console.log('Push event but no data');
    }
  
    const options = {
      body: data.message || 'Yeni bir bildirim var!',
      icon: data.icon || '/noti.png', // Bildirim ikonu ekleyebilirsiniz
      data: {
        url: data.url || 'wwww.google.com', // Bildirim tıklandığında gidilecek URL
      },
    };
  
    event.waitUntil(
      self.registration.showNotification(data.title || 'Bildirim Başlığı', options)
        .catch(error => {
          console.error('Bildirim gösterilirken hata oluştu:', error);
        })
    );
  });
  
  self.addEventListener('notificationclick', function(event) {
    event.notification.close();
  
    if (event.notification.data && event.notification.data.url) {
      event.waitUntil(
        clients.openWindow(event.notification.data.url)
          .catch(error => {
            console.error('URL açılırken hata oluştu:', error);
          })
      );
    }
  });
  