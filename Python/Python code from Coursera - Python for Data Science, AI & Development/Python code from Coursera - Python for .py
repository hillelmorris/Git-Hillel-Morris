#Python code from Coursera - Python for Data Science, AI & Development - 2026-02

# If statement example

age = 19
#age = 18

#expression that can be true or false
if age > 18:
    
    #within an indent, we have the expression that is run if the condition is true
    print("you can enter" )

#The statements after the if statement will run regardless if the condition is true or false 
print("move on")

# Else statement example

age = 18
# age = 19

if age > 18:
    print("you can enter" )
else:
    print("go see Meat Loaf" )
    
print("move on")


# Elif statment example

age = 18

if age > 18:
    print("you can enter" )
elif age == 18:
    print("go see Pink Floyd")
else:
    print("go see Meat Loaf" )
    
print("move on")


# Condition statement example

album_year = 1980

if(album_year > 1979) and (album_year < 1990):
    print ("Album year was in between 1980 and 1989")
    
print("")
print("Do Stuff..")


# Condition statement example

album_year = 1990

if(album_year < 1980) or (album_year > 1989):
    print ("Album was not made in the 1980's")
else:
    print("The Album was made in the 1980's ")


# Condition statement example

album_year = 1983

if not (album_year == 1984):
    print ("Album year is not 1984")

#Write a Python program to check if a player Lionel Messi has more than 10 achievements. 
#If the condition is true, print the player's name, sport, and achievements else print does not have more than 10 achievements.

player_name = "Lionel Messi"
sport = "Soccer"
achievements = 7

if achievements > 10:
    print(f"{player_name} plays {sport} and has {achievements} achievements.")
else:
    print(f"{player_name} does not have more than 10 achievements.")

#Write a Python program to check if a player belongs to the sport Tennis or has exactly 20 achievements. 
#If the condition is true, print a success message.

player_name = "Roger Federer"
sport = "Tennis"
achievements = 20

if sport == "Tennis" or achievements == 20:
    print(f"{player_name} meets the criteria! They play {sport} and have {achievements} achievements.")
else:
    print(f"{player_name} does not meet the criteria.")

#Write a Python program to check if a player has less than 10 achievements and does not play Soccer. 
#Print their details if they meet the criteria.

player_name = "Usain Bolt"
sport = "Athletics"
achievements = 8

if achievements < 10 and sport != "Soccer":
    print(f"{player_name} plays {sport} and has only {achievements} achievements.")
else:
    print(f"{player_name} does not meet the criteria.")


#Write a for loop that prints out all the elements between -5 and 5 using the range function.
for i in range(-5, 6):
    print(i)

#Print the elements of the following list: Genres=[ 'rock', 'R&B', 'Soundtrack', 'R&B', 'soul', 'pop']. 
#Make sure you follow Python conventions.

Genres = ['rock', 'R&B', 'Soundtrack', 'R&B', 'soul', 'pop']
for Genre in Genres:
    print(Genre)

#Write a for loop that prints out the following list: squares=['red', 'yellow', 'green', 'purple', 'blue']

squares=['red', 'yellow', 'green', 'purple', 'blue']
for square in squares:
    print(square)

#Write a while loop to display the values of the Rating of an album playlist stored in thePlayListRatings list. If the score is less than 6, exit the loop. 
#The list PlayListRatings is given by: PlayListRatings = [10, 9.5, 10, 8, 7.5, 5, 10, 10]

PlayListRatings=[10, 9.5, 10, 8, 7.5, 5, 10, 10]

i=0
score = PlayListRatings[0]
while score > 6:
    print(PlayListRatings[i])
    i=i+1
    score = PlayListRatings[i]

#or

PlayListRatings = [10, 9.5, 10, 8, 7.5, 5, 10, 10]
i = 0
Rating = PlayListRatings[0]
while(i < len(PlayListRatings) and Rating >= 6):
    print(Rating)
    i = i + 1 # This prints the value 10 only once 
    Rating = PlayListRatings[i]
    i = i + 1 #Try uncommenting the line and comment the previous i = i + 1, and see the difference, 10 value will get printed twice because when the loop 
    #starts it will print Rating and then with PlayListRatings[0], it will again assign the value 10 to Ratings. 


#Write a while loop to copy the strings 'orange' of the list squares to the list new_squares. 
#Stop and exit the loop if the value on the list is not 'orange':

squares = ['orange', 'orange', 'purple', 'blue ', 'orange']
new_squares = []
i = 0
while(i < len(squares) and squares[i] == 'orange'):
    new_squares.append(squares[i])
    i = i + 1
print (new_squares)

#Write a Python program using a for loop that prints numbers from 1 to 15 but:

#Skips multiples of 3
#Stops the loop if the number is greater than 12

for i in range(1, 16):
    if i % 3 == 0:
        continue  # skip multiples of 3
    if i > 12:
        break     # stop if number > 12
    print(i)
        

#Come up with a function that divides the first input by the second input:

def div(a, b):
    return(a/b)

#Write a function code to find total count of word little in the given string: "Mary had a little lamb Little lamb, 
# little lamb Mary had a little lamb.Its fleece was white as snow 
# And everywhere that Mary went Mary went, Mary went Everywhere that Mary went The lamb was sure to go"

# Python Program to Count words in a String using Dictionary
def freq(string,passedkey):

    #step1: A list variable is declared and initialized to an empty list.
    words = []

    #step2: Break the string into list of words
    words = string.split() # or string.lower().split()

    #step3: Declare a dictionary
    Dict = {}

    #step4: Use for loop to iterate words and values to the dictionary
    for key in words:
        if(key == passedkey):
            Dict[key] = words.count(key)   
    #step5: Print the dictionary
    print("Total Count:",Dict)

#step6: Call function and pass string in it
freq("Mary had a little lamb Little lamb, little lamb Mary had a little lamb.Its fleece was white as snow And everywhere that Mary went Mary went, Mary went \
Everywhere that Mary went The lamb was sure to go","little")

#Get count iof every word in string

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