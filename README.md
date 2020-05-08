# MassMutual Data Viz Recruitment

This project is intended to evaluate MassMutual data visualization engineering candidates. The project contains a simple web app to be use as a starting point to build data visualizations.

## Instructions

Your goal, as a data visualization engineering candidate, is to build data visualizations for a marketing manager. These visualizations should enable this user to locate and understand potential new markets or customers for the purpose of selling life insurance.

The visualizations you construct should reveal insights about the data and follow visualization best practices. Make sure the visualizations present multivariate data that enable comparisons and provide descriptive titles and labels.

NOTE: Don't feel that you need to build something really complicated. Try to focus on completing a few key charts, potentially, with form inputs to filter or change the represented data. We can talk about how the work could be extended during the on-site interview.

Use the start.py file and templates/index.html as a starting place for building web based data visualizations driven by the data found in **recruit.db**.

The index.html template is mapped to the application's root at /. Please, extend the code by adding your own API endpoints and html templates. Currently D3.js is imported into the index.html template, however, you may use any JavaScript based visualization library.

Please feel free to reach out if you have any questions.


## Setup

Make sure python3 is installed on your system:
`python3 --version`

If not, you can download python here:
https://www.python.org/downloads/

Create a python virtual environment for the **web** project:
`python3 -m venv venv`
https://docs.python.org/3/library/venv.html#creating-virtual-environments

You can activate the environment using the source command: 
`source venv/bin/activate`

Then set up the new virtual environment with the required dependencies:
`pip install -r requirements.txt`

Start the web application:
`python start.py`


## Data
This project contains an SQLite database, **recruit.db**. This database is pre-populated with data and should be utilized to produce data visualizations.

### Data Dictionary
#### customer table
* id - primary key
* race_code - foreign key to race table
* education_id - foreign key to education table
* home_owner - Home Owner / Renter, O = Home Owner, R = Renter
* state - state location in the United States
* is_smoker - whether customer is a smoker, 1 = Yes
* is_exerciser - whether customer exercises, 1 = Yes
* has_insurance - Life Insurance Policy Owner, 1 = True
* income - Income By The Thousands
* travel_spending - Amount spent by customer on Travel
* sports_leisure_spending - Amount spent by customer on Sports & Leisure
* economic_stability - 01 = Most Likely Economically Stable, 30 = Least Likely Economically Stable
* insurance_segment_id - foreign key to insurance_segment table
* youtube_user_rank - Propensity to use YouTube, 01 (Most Likely) through 20 (Least Likely)
* facebook_user_rank - Propensity to use Facebook, 01 (Most Likely) through 20 (Least Likely)
* gender - M = Male, F = Female


## Next Steps
1. Respond to the exercise email with the completed exercise. You can either link to the completed exercise or attach the compressed project to the email.
2. The completed exercise will be reviewed by the team.
3. If the team decides to move forward, a recruiter will contact you to schedule the final interview.
4. During the final interview you will meet the whole team and present your work. First you will present your running project and describe your design decisions. Then you will walk us through your code and describe your implementation decisions.
5. There will be time at the end of the interview to ask general questions.
