import socket
def send_payload(jar_path, host, port=50000):
    with open(jar_path, 'rb') as f:
        data = f.read()
    
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect((host, port))
    sock.sendall(data)
    sock.close()
    print(f"{len(data)} bytes enviados para {host}:{port}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) == 3:
        host = sys.argv[1]
        file_path = sys.argv[2]
        send_payload(file_path, host)
    elif len(sys.argv) == 4:
        host = sys.argv[1]
        port = int(sys.argv[2])
        file_path = sys.argv[3]
        send_payload(file_path, host, port)
    else:
        print("Uso: python payload_sender.py <host> <arquivo>")
        print("     python payload_sender.py <host> <porta> <arquivo>")
        print("Exemplos:")
        print("  python payload_sender.py 192.168.1.100 helloworld.js")
        print("  python payload_sender.py 192.168.1.100 50000 helloworld.js")
        print("  python payload_sender.py 192.168.1.100 9020 payload.bin")
