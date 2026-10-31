import sqlite3
import shutil
import os

if not os.path.exists('appinfo.db'):
    print("Erro: arquivo appinfo.db não encontrado!")
    exit(1)

print("Criando backup...")
shutil.copy('appinfo.db', 'appinfo.org.db')
print("Backup criado: appinfo.org.db")

conn = sqlite3.connect('appinfo.db')
cursor = conn.cursor()

TITLE_IDS = ['PPSA01650', 'PPSA01651', 'PPSA01652']

for title_id in TITLE_IDS:
    print(f"\n--- Processando {title_id} ---")

    cursor.execute("""
        SELECT key, val
        FROM tbl_appinfo
        WHERE titleId = ?
        AND key IN ('CONTENT_VERSION', 'VERSION_FILE_URI')
    """, (title_id,))
    results = cursor.fetchall()

    if len(results) != 2:
        print(f"Ignorando {title_id}: eram esperadas 2 chaves, mas foram encontradas {len(results)}")
        print(f"Chaves encontradas: {[row[0] for row in results]}")
        continue

    print("Todas as chaves necessárias foram encontradas. Prosseguindo com as atualizações...")

    cursor.execute("""
        UPDATE tbl_appinfo
        SET val = '99.999.999'
        WHERE titleId = ?
        AND key = 'CONTENT_VERSION'
    """, (title_id,))
    print(f"CONTENT_VERSION atualizado (linhas afetadas: {cursor.rowcount})")

    cursor.execute("""
        UPDATE tbl_appinfo
        SET val = 'http://127.0.0.2'
        WHERE titleId = ?
        AND key = 'VERSION_FILE_URI'
    """, (title_id,))
    print(f"VERSION_FILE_URI atualizado (linhas afetadas: {cursor.rowcount})")

    conn.commit()
    print(f"Alterações gravadas para {title_id}")

print("\nVerificando alterações...")
for title_id in TITLE_IDS:
    print(f"\n  [{title_id}]")
    cursor.execute("""
        SELECT key, val
        FROM tbl_appinfo
        WHERE titleId = ?
        AND key IN ('CONTENT_VERSION', 'VERSION_FILE_URI')
    """, (title_id,))
    rows = cursor.fetchall()

    if not rows:
        print("    Nenhuma chave correspondente encontrada.")
        continue

    for row in rows:
        print(f"    {row[0]}: {row[1]}")

conn.close()
print("\nConcluído.")
print("Original salvo em appinfo.org.db")
