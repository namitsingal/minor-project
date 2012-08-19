setup:
	virtualenv ./venv
	./venv/bin/pip install -r requirements.txt

run:
	./venv/bin/python main.py
