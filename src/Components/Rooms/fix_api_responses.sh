#!/bin/bash

# Fix Room.js
sed -i.bak 's/if (response && !response.error) {/if (response \&\& response.success) {/g' Room.js
sed -i.bak 's/setBlocks(Array.isArray(response) ? response : \[\]);/setBlocks(Array.isArray(response.data) ? response.data : []);/g' Room.js
sed -i.bak 's/setCategories(Array.isArray(response) ? response : \[\]);/setCategories(Array.isArray(response.data) ? response.data : []);/g' Room.js

# Fix Block.js
sed -i.bak 's/setBlocks(Array.isArray(response) ? response : \[\]);/setBlocks(Array.isArray(response.data) ? response.data : []);/g' Block.js

# Fix RoomCategory.js
sed -i.bak 's/setCategories(Array.isArray(response) ? response : \[\]);/setCategories(Array.isArray(response.data) ? response.data : []);/g' RoomCategory.js

# Fix Bed.js
sed -i.bak 's/setBeds(Array.isArray(response) ? response : \[\]);/setBeds(Array.isArray(response.data) ? response.data : []);/g' Bed.js
sed -i.bak 's/setRooms(Array.isArray(response) ? response : \[\]);/setRooms(Array.isArray(response.data) ? response.data : []);/g' Bed.js

# Fix Service.js
sed -i.bak 's/setServices(Array.isArray(response) ? response : \[\]);/setServices(Array.isArray(response.data) ? response.data : []);/g' Service.js

echo "Fixed all Room components!"
