import pandas as pd
import json
import sys

# Load the data
df = pd.read_csv("src/data/stack-overflow-developer-survey-2025/survey_results_public.csv", low_memory=False)
df = df.dropna(subset=['Age'])

# Define the weights for the integration levels
weights = {
    "AIToolCurrently mostly AI": 4.0,
    "AIToolCurrently partially AI": 2.0,
    "AIToolPlan to mostly use AI": 1.0,
    "AIToolPlan to partially use AI": 0.5,
    "AIToolDon't plan to use AI for this task": 0.0
}

# Restructure the data
melted = df.melt(id_vars=['Age'], value_vars=list(weights.keys()), var_name='integration_level', value_name='task')
melted = melted.dropna(subset=['task'])

exploded = melted.assign(task=melted['task'].str.split(';')).explode('task')
exploded['task'] = exploded['task'].str.strip()
exploded['weight'] = exploded['integration_level'].map(weights)

# Sum the total weights per Age and Task
grouped = exploded.groupby(['Age', 'task'])['weight'].sum().reset_index()

# Normalize within the Age Group
# Calculate the total AI "effort" for each age group
age_totals = grouped.groupby('Age')['weight'].transform('sum')

# Calculate what percentage of their total AI effort goes to this specific task
grouped['normalized_score'] = (grouped['weight'] / age_totals) * 100

grouped = grouped.sort_values(by=['Age', 'task'])


# Compute "All" category: average normalized_score per task across all age groups
all_avg = grouped.groupby('task')['normalized_score'].mean().reset_index()
all_avg['Age'] = 'All'
all_avg = all_avg[['Age', 'task', 'normalized_score']]

# Append "All" to the grouped data
grouped = pd.concat([grouped, all_avg], ignore_index=True)
grouped = grouped.sort_values(by=['Age', 'task'])

output = grouped[['Age', 'task', 'normalized_score']].to_dict(orient='records')

json.dump(output, sys.stdout)