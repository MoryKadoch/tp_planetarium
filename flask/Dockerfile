FROM python:3.9-slim

WORKDIR /app

COPY . /app

COPY planetarium.csv /app/planetarium.csv

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000

CMD ["python", "app.py"]