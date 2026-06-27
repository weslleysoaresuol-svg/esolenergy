import urllib.request
import json

url = "https://mmskdcvbnaqgbzmigfak.supabase.co/rest/v1/clientes?select=*"
headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tc2tkY3ZibmFxZ2J6bWlnZmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMjA3MzAsImV4cCI6MjA5Nzc5NjczMH0.jgZLhfRohgQL6nKe-ZYaPqvSI5-i7QktYw5OpG2fRtI",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tc2tkY3ZibmFxZ2J6bWlnZmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMjA3MzAsImV4cCI6MjA5Nzc5NjczMH0.jgZLhfRohgQL6nKe-ZYaPqvSI5-i7QktYw5OpG2fRtI"
}

print("Consultando tabela 'clientes'...")
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        print(f"Sucesso! Retornados {len(data)} clientes.")
        if len(data) > 0:
            print("Amostra do primeiro cliente:")
            print(json.dumps(data[0], indent=2, ensure_ascii=False))
        else:
            print("Nenhum cliente retornado (a tabela está vazia ou o RLS filtrou tudo).")
except Exception as e:
    print(f"Erro na requisição: {e}")
