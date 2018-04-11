# DistributedBackend
This project is a part of 2110318 Distributed Systems Essentials. A LINE-like app.
## API: User
SIGN UP
* method: POST
* url: /signup
* body: ส่ง field: username, password, name
* if success: http code 200 response


LOG IN
* method: POST
* url: /login
* body: ส่ง field: username, password
* if success: http code 200 response


LOG OUT
* method: POST
* url: /logout
* ไม่ต้องส่งอะไรมาทั้งนั้น มาแต่ตัวกับหัวใจ
* if success: http code 200 response


VALIDATE USERNAME
* method: GET
* url: /validate-username
* parameter: username
* if username available: the response json "available" will be true
* if username not available: the response json "available" will be false and be sent with username that is found in the database
* if success: http code 200 response (including when username not available)
* if error: http code 500 response


GET PROFILE
* method: GET
* url: /user
* ไม่ต้องส่งอะไรมาขอแค่log in ไว้ก่อนก็สำเร็จแล้ว
* response will include json containing "user" field containing an object of user ["username", "name", "lastOnline", "chatRooms", "lastModified", "created_date", "tokenDelete", "picture"]

## API: Chat room

CREATE NEW ROOM
* method: POST
* url: /newroom
* body: has to send fields: "join_users"
* if success: http code 200
* you can check the result เอาแบบชัวร์ๆเลยนะ ด้วยการไปดูที่ response json มันจะมี "success" ซึ่งเป็นboolean ถ้าสำเร็จก็true
* 


API อื่นๆ to be continued
