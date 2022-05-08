#!/bin/bash
rsync --progress -avb /home/devfedora/LADON/ /tmp/tmp-syncdir-CfjrZl-LADON
rm -rf /tmp/LADON
mv /tmp/tmp-syncdir-CfjrZl-LADON /tmp/LADON
