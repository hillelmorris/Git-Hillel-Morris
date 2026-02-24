import string

def freq(text):
    # normalize text
    text = text.lower().translate(str.maketrans("", "", string.punctuation))
    words = text.split()

    Dict = {}

    for word in words:
        Dict[word] = Dict.get(word, 0) + 1

    print("Word Counts:")
    print(Dict)


freq(
    "Mary had a little lamb Little lamb, little lamb Mary had a little lamb. "
    "Its fleece was white as snow And everywhere that Mary went Mary went, Mary went "
    "Everywhere that Mary went The lamb was sure to go"
)