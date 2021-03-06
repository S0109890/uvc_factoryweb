# 코드를 입력하세요.

# pip install opencv-python
# pip install pyserial

import cv2
import numpy as np
from socket import *
from select import *
import sys
from time import sleep

# mqtt
import paho.mqtt.client as mqtt
import json


def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("connected OK")
    else:
        print("Bad connection Returned code=", rc)


def on_disconnect(client, userdata, flags, rc=0):
    print(str(rc))


def on_publish(client, userdata, mid):
    print("In on_pub callback mid= ", mid)


###############################
HOST = '192.168.0.120'
PORT = 2004
BUFSIZE = 1024
ADDR = (HOST, PORT)

clientSocket = socket(AF_INET, SOCK_STREAM)  # 서버에 접속하기 위한 소켓을 생성한다.

clientSocket.connect(ADDR)  # 서버에 접속을 시도한다.

print('connect is success')


cap = cv2.VideoCapture(1)  # 0 or 1

readings = [-1, -1]
display = [0, 0]

Circle_Inertia = 0.6
Gaussian_ksize = (7, 7)
canny_threshold_min = 100
canny_threshold_max = 250

###

params = cv2.SimpleBlobDetector_Params()
params.filterByInertia = True
params.minInertiaRatio = Circle_Inertia

detector = cv2.SimpleBlobDetector_create(params)

###


# 새로운 클라이언트 생성
client = mqtt.Client()
# 콜백 함수 설정 on_connect(브로커에 접속), on_disconnect(브로커에 접속중료), on_publish(메세지 발행)
client.on_connect = on_connect
client.on_disconnect = on_disconnect
client.on_publish = on_publish
# address : localhost, port: 1883 에 연결
client.connect('localhost', 1883)
client.loop_start()
# common topic 으로 메세지 발행
##
# 토픽 ,메세지,012 qos
client.publish('test', "비전 num값 넣어줄거야", 1)
client.loop_stop()
# 연결 종료
client.disconnect()


while True:
    ret, frame = cap.read()

    frame_blurred = cv2.GaussianBlur(frame, Gaussian_ksize, 1)
    frame_gray = cv2.cvtColor(frame_blurred, cv2.COLOR_BGR2GRAY)
    frame_canny = cv2.Canny(frame_gray, canny_threshold_min,
                            canny_threshold_max, apertureSize=3, L2gradient=True)

    ####
    keypoints = detector.detect(frame_canny)

    num = len(keypoints)
    readings.append(num)

    if readings[-1] == readings[-2] == readings[-3] == readings[-4] == readings[-5] == readings[-6]:
        # if readings[-5] != readings[-4]:
        # cv2.imwrite("Before.png", frame)

        im_with_keypoints = cv2.drawKeypoints(frame, keypoints, np.array(
            []), (0, 0, 255), cv2.DRAW_MATCHES_FLAGS_DRAW_RICH_KEYPOINTS)
        cv2.putText(im_with_keypoints, str(num), (500, 250),
                    cv2.FONT_HERSHEY_SCRIPT_SIMPLEX, 5, (0, 255, 0))

        socketTxData = bytes([76, 83, 73, 83, 45, 88, 71, 84, 0, 0, 0, 0, 160, 51, 0, 0, 22,
                             0, 0, 0, 88, 0, 2, 0, 0, 0, 1, 0, 8, 0, 37, 68, 87, 48, 49, 49, 48, 48, 2, 0, ])
        # 76 83 73 83 45 88 71 84 0 0 0 0 176 51 0 0 22 0 1 1 8 8 8 8 0 2 0 0 0 108037688748494948482030
        num_little = num.to_bytes(2, 'little')
        # print(num_little)
        # socketTxData.insert(socketTxData+num_little)
        if num != 0:
            print(num)
            try:

                clientSocket.send(socketTxData + num_little)
                msg = clientSocket.recv(1024)
                print(msg)

            except Exception as e:
                print(e)
                print('%s:%s' % ADDR)

            cv2.imwrite("After.png", im_with_keypoints)
        # cv2.imshow("Dice Reader", im_with_keypoints) #break선언시 실행 불가
        # break
        sleep(0.3)

cv2.destroyAllWindows()
