import json
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow

# Step 1: Authenticate and authorize
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

def authenticate():
    flow = InstalledAppFlow.from_client_secrets_file('juggling-database/credentials.json', SCOPES)
    creds = flow.run_local_server(port=8080)
    service = build('drive', 'v3', credentials=creds)
    return service

# Step 2: Fetch files from a specific folder
def get_files_from_folder(service, folder_id):
    files = []
    page_token = None
    while True:
        response = service.files().list(
            q=f"'{folder_id}' in parents and trashed=false",
            fields="nextPageToken, files(id, name)",
            pageToken=page_token
        ).execute()
        files.extend(response.get('files', []))
        page_token = response.get('nextPageToken', None)
        if not page_token:
            break
    return files

# Step 3: Create a dictionary mapping file names to embed links
def create_embed_links(files):
    embed_links = {}
    for file in files:
        file_id = file['id']
        file_name = file['name']
        base_name = file_name.rsplit('.', 1)[0]
        embed_link = f"https://drive.google.com/file/d/{file_id}/preview"
        embed_links[base_name] = embed_link
    return embed_links

# Step 4: Update the JSON file with new data
def update_json(data, filename='juggling-database/data.json'):
    try:
        # Load existing data
        with open(filename, 'r') as json_file:
            existing_data = json.load(json_file)
    except FileNotFoundError:
        # If the file doesn't exist, start with an empty dictionary
        existing_data = {}

    # Update the existing data with new data, preserving other attributes
    for key, embed_link in data.items():
        # Create title by replacing underscores with spaces and applying title case
        title = key.replace('_', ' ').title()

        if key in existing_data:
            existing_data[key]['title'] = title
            existing_data[key]['video'] = embed_link
        else:
            # Add new entry with "title" and "video" keys
            existing_data[key] = {"title": title, "video": embed_link}

    # Save the updated data back to the file
    with open(filename, 'w') as json_file:
        json.dump(existing_data, json_file, indent=4)

# Step 5: Main execution
if __name__ == "__main__":
    folder_id = "1wf0eaD_RNAXWOCY0gf538IlrWwEkvz6J"  # Replace with your Google Drive folder ID
    service = authenticate()
    files = get_files_from_folder(service, folder_id)
    embed_links_dict = create_embed_links(files)

    # Update the JSON file with the embed links
    update_json(embed_links_dict)

    # Optionally print the dictionary
    for name, link in embed_links_dict.items():
        print(f"{name}: {link}")