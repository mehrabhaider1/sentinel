from pyngrok import ngrok
import time

tunnel = ngrok.connect(8000)
print(tunnel)

while True:
    time.sleep(60)
