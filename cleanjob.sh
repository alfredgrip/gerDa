#!/bin/bash





echo "0 6 * * * /bin/bash rm -f ~/uploads/* && rm -f ~/output/* && rm -f ~/logs/* " >> cleanjob
crontab cleanjob
rm cleanjob
