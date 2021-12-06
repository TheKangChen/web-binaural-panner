'''
Helper script for reading audio info in directory

** Assuming All files have the exact same format
** For Audio database 

1. Place script in directory of files
2. Run script in cmd

------
Return: (.json) (.txt)
------
../hrirList.txt
    List of filenames

../audio_infos.txt
    Folder name of the audio files
    Format of filename
    Number of files in directory
    Audio data shape
    Samplerate of audio file
'''

import soundfile as sf
import os
import json

current_dir = './'
dir_name = os.getcwd().split('\\')[-1]
filelist = os.listdir(current_dir)

for file in filelist:
    if file.endswith('.py'):
        filelist.remove(file)

json_list = json.dumps(filelist)

hrir_list = open('../../hrirList.json', 'w+')
hrir_list.write(json_list)
hrir_list.close()

audio, sr = sf.read(current_dir + filelist[0])

audio_info = open('../audio_infos.txt', 'w+')
audio_info.write(f'Folder name: {dir_name}\n')
audio_info.write(f'Format of filename: {filelist[0]}\n')
audio_info.write(f'Number of files: {len(filelist)}\n')
audio_info.write(f'Samplerate: {sr}\n')
audio_info.close()
