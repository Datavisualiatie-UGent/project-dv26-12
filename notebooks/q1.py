import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import json
import os


def process_ai_sentiment_by_column(df, col, mapping_col, expected_order=None, mapping=None, ai_sent_col='AISent'):
    # 1. Setup and Clean Data
    aimodels = df[[ai_sent_col, col]].copy()
    aimodels = aimodels.dropna()

    if mapping is not None:
        aimodels[mapping_col] = aimodels[col].map(mapping)
    else:
        aimodels[mapping_col] = aimodels[col]

    if expected_order is not None :
        aimodels[mapping_col] = pd.Categorical(aimodels[mapping_col], categories=expected_order, ordered=True)
    else :
        aimodels[mapping_col] = pd.Categorical(aimodels[mapping_col])
    
    expected_sent_order = ["Very favorable", "Favorable", "Indifferent", "Unsure", "Unfavorable", "Very unfavorable"]
    aimodels[ai_sent_col] = pd.Categorical(aimodels[ai_sent_col], categories=expected_sent_order, ordered=True)

    # 2. Create the base dataframe of proportions (0.0 to 1.0)
    df_proportions = pd.crosstab(aimodels[mapping_col], aimodels[ai_sent_col], normalize='index')

    # 3. Convert to percentages and round to 2 decimal places
    df_percentages = (df_proportions * 100).round(2)

    # 4. Clean up the dataframe structure
    # Reset index makes 'AgeGroup' a normal column instead of the dataframe's index
    df_percentages = df_percentages.reset_index()

    # Remove the leftover 'AISent' label from the columns axis for a cleaner table
    df_percentages.columns.name = None 

    return df_percentages

def create_plot_from_percentages(df_percentages, column, add_labels=True):
    # 1. Apply Seaborn styling
    sns.set_theme(style="whitegrid")

    # 2. Plot the stacked HORIZONTAL bar chart directly from df_percentages
    # By setting x='AgeGroup', pandas knows to use that column for the y-axis labels
    plt.figure(figsize=(12, 7))
    ax = df_percentages.plot(
        x=column, 
        kind='barh', 
        stacked=True, 
        colormap='RdYlGn_r', 
        ax=plt.gca()
    )


    if add_labels:
        # 3. Add Percentage Labels inside the bars
        for p in ax.patches:
            height = p.get_height()
            width = p.get_width() # Width is now the actual percentage (e.g., 25.5)
            x, y = p.get_xy()
            
            # Only show text if the bar segment is larger than 3%
            if width > 3:
                center_x = x + width / 2
                center_y = y + height / 2
                
                # We no longer multiply by 100, just format the width directly
                ax.text(center_x, center_y, f'{width:.1f}%', 
                        ha='center', va='center', color='black', fontsize=9)

    # 4. Formatting the chart
    plt.title(f'Percentage Distribution of AI Sentiment by "{column}" Level')
    plt.xlabel('Percentage (%)')
    plt.ylabel(column)

    # Explicitly cap the X-axis from 0 to 100
    plt.xlim(0, 100)

    # Invert the Y-axis so the top row of the dataframe (18-24) stays at the top of the plot
    ax.invert_yaxis()

    # Move legend outside the plot area
    plt.legend(title='AI Sentiment', bbox_to_anchor=(1.05, 1), loc='upper left')

    plt.tight_layout()

    # Display the plot
    plt.show()

# get all unique values in a column
def get_unique_values(df, col) -> list:
    unique_values = df[col].unique()
    return list(unique_values)

def to_json(df, filename):
    df.to_json(filename, orient="records")

def sort_by_combined_sentiment(df, col1="Very favorable", col2="Favorable"):
    """
    Sorts a dataframe based on the combined sum of two specific columns.
    Returns a new sorted dataframe.
    """
    # 1. Create a copy so we don't accidentally modify the original dataframe
    df_sorted = df.copy()
    
    # 2. Create the temporary sorting column
    temp_col = "Temp_Combined_Score"
    df_sorted[temp_col] = df_sorted[col1] + df_sorted[col2]
    
    # 3. Sort highest to lowest and reset the index
    df_sorted = df_sorted.sort_values(by=temp_col, ascending=False).reset_index(drop=True)
    
    # 4. Drop the temporary column and return the clean data
    return df_sorted.drop(columns=[temp_col])

def rescale_polarized_sentiment(df, column):
    """
    Drops neutral categories, aggregates positive/negative sentiments, 
    and rescales them to sum to 100%.
    """
    # 1. Create a copy so we don't accidentally modify the original dataframe
    df_clean = df.copy()
    
    # 2. Aggregate the sentiments
    df_clean['Total Favorable'] = df_clean['Very favorable'] + df_clean['Favorable']
    df_clean['Total Unfavorable'] = df_clean['Very unfavorable'] + df_clean['Unfavorable']
    
    # 3. Calculate the new total base (excluding the dropped categories)
    # This is what allows us to rescale the remaining data to exactly 100%
    new_total = df_clean['Total Favorable'] + df_clean['Total Unfavorable']
    
    # 4. Rescale the aggregated columns
    df_clean['Favorable (Rescaled %)'] = (df_clean['Total Favorable'] / new_total) * 100
    df_clean['Unfavorable (Rescaled %)'] = (df_clean['Total Unfavorable'] / new_total) * 100
    
    # 5. Filter the dataframe to only return the final required columns
    # This automatically drops 'Indifferent', 'Unsure', and the original individual columns
    final_columns = [column, 'Favorable (Rescaled %)', 'Unfavorable (Rescaled %)']
    
    # Optional: round the results to 2 decimal places for a cleaner look
    df_final = df_clean[final_columns].round(2)
    
    return df_final

def rescale_four_sentiments(df, category_col):
    """
    Drops neutral categories and rescales the remaining 4 polarized 
    sentiments so they sum to exactly 100%.
    """
    # 1. Create a copy so we don't alter the original dataframe
    df_clean = df.copy()
    
    # 2. Define exactly which columns we want to keep and rescale
    sentiment_cols = [
        "Very favorable", 
        "Favorable", 
        "Unfavorable", 
        "Very unfavorable"
    ]
    
    # 3. Calculate the new base total per row (ignoring Indifferent and Unsure)
    # .sum(axis=1) tells pandas to add the values horizontally across the row
    df_clean['New Base Total'] = df_clean[sentiment_cols].sum(axis=1)
    
    # 4. Loop through our 4 columns and overwrite them with the rescaled math
    for col in sentiment_cols:
        # We append "(Rescaled %)" to the column names so you know they were altered
        rescaled_name = f"{col} (Rescaled %)"
        df_clean[rescaled_name] = (df_clean[col] / df_clean['New Base Total']) * 100
        
    # 5. Build a list of the exact columns we want to return
    final_columns = [category_col] + [f"{col} (Rescaled %)" for col in sentiment_cols]
    
    # 6. Return the cleaned, rounded dataframe
    return df_clean[final_columns].round(2)


class DashboardDataBuilder:
    def __init__(self, filename):
        self.filename = filename
        # 1. Load the existing file into memory immediately, or start fresh
        if os.path.exists(filename):
            with open(filename, 'r') as f:
                self.data = json.load(f)
        else:
            self.data = {}

    def add_data(self, df, primary_key, sub_key):
        """Adds a dataframe to the in-memory JSON structure."""
        # Ensure the primary key exists and is a dictionary
        if primary_key not in self.data:
            self.data[primary_key] = {}
        elif not isinstance(self.data[primary_key], dict):
            # Safeguard: If it was previously a list, wrap it in a dict
            self.data[primary_key] = {"original_data": self.data[primary_key]}
            
        # Convert dataframe and store it in memory
        self.data[primary_key][sub_key] = df.to_dict(orient="records")
        print(f"Added '{sub_key}' to '{primary_key}' in memory.")

    def save(self):
        """Writes the entire in-memory dictionary to the file ONCE."""
        with open(self.filename, 'w') as f:
            json.dump(self.data, f, indent=2)
        print(f"✅ Successfully saved all changes to {self.filename}")


def add_and_filtered(builder, newdf, category):
    polarized = rescale_polarized_sentiment(newdf, column=category)
    polarized_four = rescale_four_sentiments(newdf, category_col=category)

    builder.add_data(newdf, primary_key=category, sub_key="Category")
    builder.add_data(sort_by_combined_sentiment(newdf, col1="Very favorable", col2="Favorable"), primary_key=category, sub_key="Favorable")
    builder.add_data(sort_by_combined_sentiment(newdf, col1="Very unfavorable", col2="Unfavorable"), primary_key=category, sub_key="Unfavorable")

    builder.add_data(polarized, primary_key=category, sub_key="Polarized")

    builder.add_data(polarized_four, primary_key=category, sub_key="PolarizedFour")
    builder.add_data(sort_by_combined_sentiment(polarized_four, col1="Very favorable (Rescaled %)", col2="Favorable (Rescaled %)"), primary_key=category, sub_key="PolarizedFourFavorable")
    builder.add_data(sort_by_combined_sentiment(polarized_four, col1="Very unfavorable (Rescaled %)", col2="Unfavorable (Rescaled %)"), primary_key=category, sub_key="PolarizedFourUnfavorable")


def agegroup(df, builder):
    age_mapping = {
        '18-24 years old': '18-24',
        '25-34 years old': '25-34',
        '35-44 years old': '35-44',
        '45-54 years old': '45-54',
        '55-64 years old': '55-64',
        '65 years or older': '65+'
    }

    expected_age_order = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+']

    newdf = process_ai_sentiment_by_column(df, col='Age', mapping_col='AgeGroup', mapping=age_mapping, expected_order=expected_age_order)
    add_and_filtered(builder, newdf, category="AgeGroup")

def education(df, builder):
    education_mapping = {
        'Master’s degree (M.A., M.S., M.Eng., MBA, etc.)': 'Master',
        'Associate degree (A.A., A.S., etc.)': 'Associate',
        'Bachelor’s degree (B.A., B.S., B.Eng., etc.)': 'Bachelor',
        'Some college/university study without earning a degree': 'Some College',
        'Professional degree (JD, MD, Ph.D, Ed.D, etc.)': 'Professional',
        'Secondary school (e.g. American high school, German Realschule or Gymnasium, etc.)': 'Secondary',
        'Other (please specify):': 'Other',
        'Primary/elementary school': 'Primary'
    }

    expected_age_order = ["Primary", "Secondary", "Associate", "Bachelor", "Master", "Professional", "Other"]

    df_percentages = process_ai_sentiment_by_column(df, col='EdLevel', mapping_col='Education', mapping=education_mapping, expected_order=expected_age_order)
    add_and_filtered(builder, df_percentages, category="Education")

def profession(df, builder):
    profession_mapping = {
        'I am a developer by profession': 'Developer',
        'I am not primarily a developer, but I write code sometimes as part of my work/studies': 'Non-Developer (Code Writer)',
        'I used to be a developer by profession, but no longer am': 'Former Developer',
        'I code primarily as a hobby': 'Hobbyist',
        'I work with developers or my work supports developers but am not a developer by profession': 'Support Role',
        'I am learning to code': 'Learning'
    }

    expected_profession_order = ["Developer", "Non-Developer (Code Writer)", "Former Developer", "Hobbyist", "Support Role", "Learning"]
    df_percentages = process_ai_sentiment_by_column(df, col='MainBranch', mapping_col='Profession', mapping=profession_mapping, expected_order=expected_profession_order)
    add_and_filtered(builder, df_percentages, category="Profession")

def employment(df, builder):
    employment_mapping = {
        'Employed': 'Employed',
        'Independent contractor, freelancer, or self-employed': 'Self-employed',
        'Student': 'Student',
        'Retired': 'Retired',
        'Not employed': 'Not employed',
        'I prefer not to say': 'Prefer not to say'
    }

    expected_employment_order = ['Employed', 'Self-employed', 'Student', 'Retired', 'Not employed', 'Prefer not to say']


    df_percentages = process_ai_sentiment_by_column(df, col='Employment', mapping_col='Employment', mapping=employment_mapping, expected_order=expected_employment_order)
    add_and_filtered(builder, df_percentages, category="Employment")

def language(df, builder, top_x=20):
    newdf = df[["LanguageHaveWorkedWith", "AISent"]].copy() 
    newdf['LanguageHaveWorkedWith'] = newdf['LanguageHaveWorkedWith'].str.split(';')

    df_exploded = newdf.explode('LanguageHaveWorkedWith').reset_index(drop=True)
    df_exploded['LanguageHaveWorkedWith'] = df_exploded['LanguageHaveWorkedWith'].str.strip()

    top_x_languages = df_exploded['LanguageHaveWorkedWith'].value_counts().nlargest(top_x).index
    df_exploded = df_exploded[df_exploded['LanguageHaveWorkedWith'].isin(top_x_languages)]
    df_percentages = process_ai_sentiment_by_column(df_exploded, col='LanguageHaveWorkedWith', mapping_col='Language')
    df_percentages = df_percentages.sort_values(by="Language", ascending=True)

    add_and_filtered(builder, df_percentages, category="Language")

def main():
    current_dir = os.getcwd()
    print(f"Current Working Directory: {current_dir}\n")

    # 2. List all files and folders in that exact directory
    print("Contents of this directory:")
    for item in os.listdir(current_dir):
        print(f"- {item}")

    df = pd.read_csv('resources/stack-overflow-developer-survey-2025/survey_results_public.csv')
    dashboard_builder = DashboardDataBuilder('builder_age_ai_sentiment.json')
    agegroup(df, dashboard_builder)
    education(df, dashboard_builder)
    profession(df, dashboard_builder)
    employment(df, dashboard_builder)
    language(df, dashboard_builder)
    dashboard_builder.save()

if __name__ == "__main__":
    main()