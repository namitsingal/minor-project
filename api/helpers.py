import cgi
import json

def encode_xml(obj):
	'''Encode a dict object to an xml string'''
	string = ''

	# Text node
	if type(obj) != dict and type(obj) != list:
		return cgi.escape(obj)

	if type(obj) == list:
		for element in obj:
			string = string + encode_xml({'item': element})
		return string
	for x, y in obj.iteritems():
		if x:
			string = '<' + x + '>' + encode_xml(y) + '</' + x + '>' + string

	return string

def encode_json(obj):
	return json.dumps(obj)