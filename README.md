# opcua_tag_manager

A very simple and rudimentary app to add a web interface to manage azure opc ua publisher published nodes that are not managed by opc twin.
Purely experminetal and not thoroughly tested.

Clone, bulld image, upload to your container registry. 
Use container creation settings to mount the volume where the published nodes are stored and set an env PORT for the exposed web interface (default is 8080)
Web server listens on port 80800 (which is an ENV, so you can choose whatever you want).
