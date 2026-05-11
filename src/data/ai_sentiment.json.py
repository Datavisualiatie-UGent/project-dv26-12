import pandas as pd
import json
import sys

# Load the data
df = pd.read_csv(
    "src/data/stack-overflow-developer-survey-2025/survey_results_public.csv",
    low_memory=False,
)

def process_ai_sentiment_by_column(df, col, mapping_col, expected_order=None, mapping=None, ai_sent_col='AISent'):
    # Setup and Clean Data
    aimodels = df[[ai_sent_col, col]].copy()
    aimodels = aimodels.dropna()

    if mapping is not None:
        aimodels[mapping_col] = aimodels[col].map(mapping)
    else:
        aimodels[mapping_col] = aimodels[col]

    if expected_order is not None:
        aimodels[mapping_col] = pd.Categorical(aimodels[mapping_col], categories=expected_order, ordered=True)
    else:
        aimodels[mapping_col] = pd.Categorical(aimodels[mapping_col])
    
    expected_sent_order = ["Very favorable", "Favorable", "Indifferent", "Unsure", "Unfavorable", "Very unfavorable"]
    aimodels[ai_sent_col] = pd.Categorical(aimodels[ai_sent_col], categories=expected_sent_order, ordered=True)

    # Create the base dataframe of proportions (0.0 to 1.0)
    df_proportions = pd.crosstab(aimodels[mapping_col], aimodels[ai_sent_col], normalize='index')

    # Convert to percentages and round to 2 decimal places
    df_percentages = (df_proportions * 100).round(2)

    # Clean up the dataframe structure
    df_percentages = df_percentages.reset_index()
    df_percentages.columns.name = None 

    return df_percentages

def sort_by_combined_sentiment(df, col1="Very favorable", col2="Favorable"):
    """
    Sorts a dataframe based on the combined sum of two specific columns.
    Returns a new sorted dataframe.
    """
    df_sorted = df.copy()
    temp_col = "Temp_Combined_Score"
    df_sorted[temp_col] = df_sorted[col1] + df_sorted[col2]
    df_sorted = df_sorted.sort_values(by=temp_col, ascending=False).reset_index(drop=True)
    return df_sorted.drop(columns=[temp_col])

def rescale_polarized_sentiment(df, column):
    """
    Drops neutral categories, aggregates positive/negative sentiments, 
    and rescales them to sum to 100%.
    """
    df_clean = df.copy()
    
    df_clean['Total Favorable'] = df_clean['Very favorable'] + df_clean['Favorable']
    df_clean['Total Unfavorable'] = df_clean['Very unfavorable'] + df_clean['Unfavorable']
    
    new_total = df_clean['Total Favorable'] + df_clean['Total Unfavorable']
    
    df_clean['Favorable (Rescaled %)'] = (df_clean['Total Favorable'] / new_total) * 100
    df_clean['Unfavorable (Rescaled %)'] = (df_clean['Total Unfavorable'] / new_total) * 100
    
    final_columns = [column, 'Favorable (Rescaled %)', 'Unfavorable (Rescaled %)']
    df_final = df_clean[final_columns].round(2)
    
    return df_final

def rescale_four_sentiments(df, category_col):
    """
    Drops neutral categories and rescales the remaining 4 polarized 
    sentiments so they sum to exactly 100%.
    """
    df_clean = df.copy()
    
    sentiment_cols = [
        "Very favorable", 
        "Favorable", 
        "Unfavorable", 
        "Very unfavorable"
    ]
    
    df_clean['New Base Total'] = df_clean[sentiment_cols].sum(axis=1)
    
    for col in sentiment_cols:
        rescaled_name = f"{col} (Rescaled %)"
        df_clean[rescaled_name] = (df_clean[col] / df_clean['New Base Total']) * 100
        
    final_columns = [category_col] + [f"{col} (Rescaled %)" for col in sentiment_cols]
    
    return df_clean[final_columns].round(2)

def add_and_filtered(newdf, category):
    polarized = rescale_polarized_sentiment(newdf, column=category)
    polarized_four = rescale_four_sentiments(newdf, category_col=category)

    return {
        "Category": newdf,
        "Favorable": sort_by_combined_sentiment(newdf, col1="Very favorable", col2="Favorable"),
        "Unfavorable": sort_by_combined_sentiment(newdf, col1="Very unfavorable", col2="Unfavorable"),
        "Polarized": polarized,
        "PolarizedFour": polarized_four,
        "PolarizedFourFavorable": sort_by_combined_sentiment(polarized_four, col1="Very favorable (Rescaled %)", col2="Favorable (Rescaled %)"),
        "PolarizedFourUnfavorable": sort_by_combined_sentiment(polarized_four, col1="Very unfavorable (Rescaled %)", col2="Unfavorable (Rescaled %)")
    }

# AgeGroup
age_mapping = {
    '18-24 years old': '18-24',
    '25-34 years old': '25-34',
    '35-44 years old': '35-44',
    '45-54 years old': '45-54',
    '55-64 years old': '55-64',
    '65 years or older': '65+'
}
expected_age_order = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+']
agegroup_df = process_ai_sentiment_by_column(df, col='Age', mapping_col='AgeGroup', mapping=age_mapping, expected_order=expected_age_order)
agegroup_data = add_and_filtered(agegroup_df, category="AgeGroup")

# Education
education_mapping = {
    'Master\'s degree (M.A., M.S., M.Eng., MBA, etc.)': 'Master',
    'Master’s degree (M.A., M.S., M.Eng., MBA, etc.)': 'Master',
    'Associate degree (A.A., A.S., etc.)': 'Associate',
    'Bachelor\'s degree (B.A., B.S., B.Eng., etc.)': 'Bachelor',
    'Bachelor’s degree (B.A., B.S., B.Eng., etc.)': 'Bachelor',
    'Some college/university study without earning a degree': 'Some College',
    'Professional degree (JD, MD, Ph.D, Ed.D, etc.)': 'Professional',
    'Secondary school (e.g. American high school, German Realschule or Gymnasium, etc.)': 'Secondary',
    'Other (please specify):': 'Other',
    'Primary/elementary school': 'Primary'
}
expected_education_order = ["Primary", "Secondary", "Associate", "Bachelor", "Master", "Professional", "Other"]
education_df = process_ai_sentiment_by_column(df, col='EdLevel', mapping_col='Education', mapping=education_mapping, expected_order=expected_education_order)
education_data = add_and_filtered(education_df, category="Education")

# Profession
profession_mapping = {
    'I am a developer by profession': 'Developer',
    'I am not primarily a developer, but I write code sometimes as part of my work/studies': 'Non-Developer (Code Writer)',
    'I used to be a developer by profession, but no longer am': 'Former Developer',
    'I code primarily as a hobby': 'Hobbyist',
    'I work with developers or my work supports developers but am not a developer by profession': 'Support Role',
    'I am learning to code': 'Learning'
}
expected_profession_order = ["Developer", "Non-Developer (Code Writer)", "Former Developer", "Hobbyist", "Support Role", "Learning"]
profession_df = process_ai_sentiment_by_column(df, col='MainBranch', mapping_col='Profession', mapping=profession_mapping, expected_order=expected_profession_order)
profession_data = add_and_filtered(profession_df, category="Profession")

# Employment
employment_mapping = {
    'Employed': 'Employed',
    'Independent contractor, freelancer, or self-employed': 'Self-employed',
    'Student': 'Student',
    'Retired': 'Retired',
    'Not employed': 'Not employed',
    'I prefer not to say': 'Prefer not to say'
}
expected_employment_order = ['Employed', 'Self-employed', 'Student', 'Retired', 'Not employed', 'Prefer not to say']
employment_df = process_ai_sentiment_by_column(df, col='Employment', mapping_col='Employment', mapping=employment_mapping, expected_order=expected_employment_order)
employment_data = add_and_filtered(employment_df, category="Employment")

# Language
def process_language_data(df, top_x=20):
    newdf = df[["LanguageHaveWorkedWith", "AISent"]].copy() 
    newdf['LanguageHaveWorkedWith'] = newdf['LanguageHaveWorkedWith'].str.split(';')

    df_exploded = newdf.explode('LanguageHaveWorkedWith').reset_index(drop=True)
    df_exploded['LanguageHaveWorkedWith'] = df_exploded['LanguageHaveWorkedWith'].str.strip()

    top_x_languages = df_exploded['LanguageHaveWorkedWith'].value_counts().nlargest(top_x).index
    df_exploded = df_exploded[df_exploded['LanguageHaveWorkedWith'].isin(top_x_languages)]
    df_percentages = process_ai_sentiment_by_column(df_exploded, col='LanguageHaveWorkedWith', mapping_col='Language')
    df_percentages = df_percentages.sort_values(by="Language", ascending=True)

    return add_and_filtered(df_percentages, category="Language")

language_data = process_language_data(df)

# Build the final result
result = {
    "AgeGroup": agegroup_data,
    "Education": education_data,
    "Profession": profession_data,
    "Employment": employment_data,
    "Language": language_data
}

# Convert dataframes to dictionaries for JSON serialization
def convert_to_serializable(obj):
    if isinstance(obj, dict):
        return {k: convert_to_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, pd.DataFrame):
        return obj.to_dict(orient='records')
    else:
        return obj

serializable_result = convert_to_serializable(result)
json.dump(serializable_result, sys.stdout)
