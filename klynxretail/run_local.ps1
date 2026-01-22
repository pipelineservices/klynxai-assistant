# Run local core API (includes web UI)
$env:KLYNX_RETAIL_PORT="9200"
cd .\core
if (-not (Test-Path .venv)) { python -m venv .venv }
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python main.py
