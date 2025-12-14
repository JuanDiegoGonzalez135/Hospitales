package utez.edu.mx.backhospitales.Utils;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.stereotype.Service;

@Service
public class FirebaseMessagingService {

    public String sendNotificationToToken(String token, String title, String body) {
        try {
            if (token == null || token.trim().isEmpty()) {
                System.out.println("❌ Token vacío. No se envía notificación.");
                return "Token vacío";
            }
            Message message = Message.builder()
                    .setToken(token)
                    .setNotification(
                            Notification.builder()
                                    .setTitle(title)
                                    .setBody(body)
                                    .build()
                    )
                    .build();

            return FirebaseMessaging.getInstance().send(message);

        } catch (Exception e) {
            e.printStackTrace();
            return "Error enviando notificación";
        }
    }
}