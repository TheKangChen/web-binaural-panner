'''
Helper script for renaming SADIE II HRIR database

1. Place script in directory of files
2. Run script in cmd

------
Return: (None)
------
Rename files
'''

import os

filelist = os.listdir('./')

for file in filelist:
    if file.endswith('.py'):
        filelist.remove(file)
    else:
        new_file = file.replace(',','.')
        os.rename(file, new_file)
