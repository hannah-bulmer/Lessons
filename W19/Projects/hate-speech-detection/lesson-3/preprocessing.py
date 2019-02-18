import pandas as pd

# Read CSV file into Pandas Dataframe
# Rename columns of dataframe
df = pd.read_csv("filename.csv", encoding="utf-8")
df.columns = [
  'sentiment', 
  'user_id', 
  'time', 
  'query', 
  'user_name', 
  'text'
]

# Trim dataframe to relevant columns
# Extract 1000 examples each of positive and negative tweets
df = df[['sentiment', 'text']]
negative = df.loc[df['sentiment'] == 0, ['sentiment', 'text']].head(1000)
positive = df.loc[df['sentiment'] == 4, ['sentiment', 'text']].head(1000)

# Create our final dataset and pickle it for later
df = pd.concat([negative, positive])
data.to_pickle("sentiment_data.pkl")
