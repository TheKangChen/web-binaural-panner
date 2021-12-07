'''
Helper script for converting audio into 32 bit float

** Assuming All files have the exact same format
** For Audio database 

1. Place script in directory of files
2. Run script in cmd

------
Return: (.bin)
------
None
'''

import soundfile as sf
import os
import numpy as np

current_dir = './H11_48K_24bit/'
dir_name = os.getcwd().split('\\')[-1]
filelist = os.listdir(current_dir)

array = True
sample_length = 256

for file in filelist:
    if file.endswith('.py'):
        filelist.remove(file)
    else:
        azi = file.split('_')[1]
        ele = file.split('_')[3][:-4]

        audio, sr = sf.read(current_dir + file)
        audio_float32 = audio.astype(np.float32)
        if array:
            float32_array = audio_float32[:,0]
            float32_array = np.append(float32_array, audio_float32[:,1])
            array = False
        else:
            float32_array = np.append(float32_array, audio_float32[:,0])
            float32_array = np.append(float32_array, audio_float32[:,1])
        


norm_audio_float32 = float32_array / np.amax(abs(float32_array))
float32_array.tofile('hrir.bin')
