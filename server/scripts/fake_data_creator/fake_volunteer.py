import csv
import io
from tabulate import tabulate
import random
from google.cloud import storage
from google.api_core import exceptions as google_exceptions
from datetime import datetime, timedelta
import os
from faker import Faker

fake = Faker('he_IL')  # Use Hebrew locale for generating realistic Israeli names and details

def create_volunteer_folder(volunteer_name):
    folder_name = volunteer_name.replace(" ", "_")
    os.makedirs(folder_name, exist_ok=True)
    return folder_name

def generate_personal_info():
    return {
        'שם': fake.name(),
        'גיל': random.randint(18, 70),
        'מין': random.choice(['ז', 'נ']),
        'גובה': random.randint(150, 200),
        'מידת מושב בסקי ישיבה': random.randint(30, 50),
        'מידת חגורת ציפה': random.choice(['S', 'M', 'L', 'XL']),
        'שנת הצטרפות לצוות': random.randint(2010, 2024),
        'טלפון': fake.phone_number(),
        'מייל': fake.email(),
        'שם איש קשר בחירום': fake.name(),
        'טלפון איש קשר בחירום': fake.phone_number()
    }

def generate_abilities():
    abilities = ['סקי מים בעמידה - עם עוד מתנדב', 'סקי מים בעמידה - לבד', 'סקי מים בישיבה - עם עוד מתנדב', 'סקי מים בישיבה - לבד']
    return [{
        'יכולת': ability,
        'דירוג 1-9': random.randint(1, 9),
        'הערות': fake.sentence()
    } for ability in abilities]

def generate_certifications():
    certifications = ['אחראי פעילות', 'מדריך סקי', 'רישיון שיט', 'נהג מוסמך', 'מגיש עזרה ראשונה']
    return [{
        'הסמכות': cert,
        'כן/לא': random.choice(['כן', 'לא']),
        'הערות': fake.sentence() if random.choice([True, False]) else ''
    } for cert in certifications]


# def write_csv_to_gcs(data, bucket_name, blob_name):
#     client = storage.Client(project='Ski-Etgarim-092924')
#     bucket = client.bucket(bucket_name)
#     blob = bucket.blob(blob_name)
    
#     csv_content = ""
#     fieldnames = data[0].keys()
#     csv_content += ",".join(fieldnames) + "\n"
#     for row in data:
#         csv_content += ",".join(str(row[field]) for field in fieldnames) + "\n"
    
#     blob.upload_from_string(csv_content, content_type='text/csv')

def write_csv_to_gcs(data, bucket_name, blob_name):
    try:
        client = storage.Client(project='Ski-Etgarim-092924')
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(blob_name)
        
        csv_content = ""
        fieldnames = data[0].keys()
        csv_content += ",".join(fieldnames) + "\n"
        for row in data:
            csv_content += ",".join(str(row[field]) for field in fieldnames) + "\n"
        
        blob.upload_from_string(csv_content, content_type='text/csv')
        print(f"Successfully uploaded {blob_name} to {bucket_name}")
    except google_exceptions.Forbidden as e:
        print(f"Permission denied: {e}")
        print("Please check your GCP credentials and bucket permissions.")
    except Exception as e:
        print(f"An error occurred while uploading to GCS: {e}")

def generate_volunteer_files(num_volunteers=20):
    bucket_name = 'ski-etgarim-dev-092924'
    base_folder = 'volunteers'
    
    for _ in range(num_volunteers):
        personal_info = generate_personal_info()
        volunteer_name = personal_info['שם']
        folder_name = volunteer_name.replace(" ", "_")
        
        # Write personal info CSV
        write_csv_to_gcs([personal_info], bucket_name, f"{base_folder}/{folder_name}/personal_info.csv")
        
        # Write abilities CSV
        write_csv_to_gcs(generate_abilities(), bucket_name, f"{base_folder}/{folder_name}/abilities.csv")
        
        # Write certifications CSV
        write_csv_to_gcs(generate_certifications(), bucket_name, f"{base_folder}/{folder_name}/certifications.csv")

    print(f"Generated data for {num_volunteers} volunteers in Google Cloud Storage bucket.")


def display_csv(bucket_name, blob_name, title):
    print(f"\n{title}:")
    try:
        client = storage.Client(project='Ski-Etgarim-092924')
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(blob_name)
        
        content = blob.download_as_text()
        csvfile = io.StringIO(content)
        reader = csv.DictReader(csvfile)
        data = list(reader)
        if data:
            headers = data[0].keys()
            table = [[row[col] for col in headers] for row in data]
            print(tabulate(table, headers=headers, tablefmt="grid"))
        else:
            print("No data found in the file.")
    except google_exceptions.NotFound:
        print(f"File not found: {blob_name}")
    except Exception as e:
        print(f"Error reading file {blob_name}: {str(e)}")


# Main function to run the script
if __name__ == "__main__":
    # Create folders for volunteers and save them in GCP
    generate_volunteer_files(num_volunteers=5)
    
    # Display personal info from GCP
    # display_csv('ski-etgarim-dev-092924', 'volunteers/דור_לב/personal_info.csv', "Personal Information")