'''
Helper script for listing number of azimuth and elevation of HRIR database

** Assuming All files have the exact same format
** For Audio database 

1. Place script in directory of files
2. Run script in cmd

------
Return: (.json)
------
../../aziList.json
    List of Azimuth (reordered to leftmost -> center -> rightmost)

../../eleList.json
    List of elevation (reordered to lowest -> highest)
'''

import soundfile as sf
import os
import json

current_dir = './H11_48K_24bit'
dir_name = os.getcwd().split('\\')[-1]
filelist = os.listdir(current_dir)
file_dict = {}
azi_list = []
ele_list = []

for file in filelist:
    if file.endswith('.py'):
        filelist.remove(file)
    else:
        listA = file.split('_')
        azi = listA[1]
        ele = listA[3][:-4]

        azi_list.append(azi)
        ele_list.append(ele)
        azi = float(azi)
        ele = float(ele)

        if azi not in file_dict:
            file_dict[azi] = []
        else:
            file_dict[azi].append(ele)
        
float_azi_list = [float(x) for x in azi_list]
uniq_azi_list = list(set(float_azi_list))
uniq_azi_list.sort()

float_ele_list = [float(x) for x in ele_list]
uniq_ele_list = list(set(float_ele_list))
uniq_ele_list.sort()

left = uniq_azi_list[:97]
right = uniq_azi_list[97:]
new_azi = right + left
new_azi.reverse()

json_azi_list = json.dumps(new_azi)

aziList = open('../../aziList.json', 'w+')
aziList.write(json_azi_list)
aziList.close()


json_ele_list = json.dumps(uniq_ele_list)

eleList = open('../../eleList.json', 'w+')
eleList.write(json_ele_list)
eleList.close()
