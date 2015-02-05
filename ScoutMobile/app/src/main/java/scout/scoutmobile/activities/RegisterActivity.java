package scout.scoutmobile.activities;

import android.app.Activity;
import android.app.ProgressDialog;
import android.content.Intent;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.EditText;

import com.parse.ParseException;
import com.parse.ParseUser;
import com.parse.SignUpCallback;

import scout.scoutmobile.PlacesActivity;
import scout.scoutmobile.R;
import scout.scoutmobile.constants.Consts;
import scout.scoutmobile.models.User;


public class RegisterActivity extends Activity {

    private static final int MIN_USER_PASSWORD_LENGTH = 6;

    private EditText mEmailEditText;
    private EditText mPasswordEditText;
    private EditText mRetypedPasswordEditText;
    private EditText mFirstNameEditText;
    private EditText mLastNameEditText;

    private ProgressDialog mRegisterLoader;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        mRegisterLoader = new ProgressDialog(RegisterActivity.this);
        mRegisterLoader.setMessage(getString(R.string.spinner_register));

        //setup submit button
        Button submitBtn = (Button) findViewById(R.id.register_accept_btn);
        submitBtn.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                createAccount();
            }
        });

        //setup cancel button
        Button cancelBtn = (Button) findViewById(R.id.register_cancel_btn);
        cancelBtn.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });

        mEmailEditText = (EditText) findViewById(R.id.register_email_edittext);
        mPasswordEditText = (EditText) findViewById(R.id.register_password_edittext);
        mRetypedPasswordEditText = (EditText) findViewById(R.id.register_password_again_edittext);
        mFirstNameEditText = (EditText) findViewById(R.id.register_name_first_edittext);
        mLastNameEditText = (EditText) findViewById(R.id.register_name_last_edittext);
    }


    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_register, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    private void showLoader(boolean show) {
        if (show) {
            mRegisterLoader.show();
        } else {
            mRegisterLoader.dismiss();
        }
    }

    /**
     * Checks whether or not the email is valid syntax wise, it however does not validate the email
     * given with any external source
     * @param email the email provided by user
     * @return true if valid, false other wise
     */
    private boolean isEmailValid(String email) {
        return !email.isEmpty() && email.matches(Consts.EMAIL_VALIDATING_REGEX);
    }

    private boolean isPasswordValid(String password) {
        return password.length() >= MIN_USER_PASSWORD_LENGTH; //TODO change this
    }

    /**
     * Attempt to create an account in parse database. Before the server query, valid string checks
     * are made on email, password and verify password field.
     */
    private void createAccount() {

        String email = mEmailEditText.getText().toString().trim();
        String password = mPasswordEditText.getText().toString();
        String verifyPass = mRetypedPasswordEditText.getText().toString();

        View focusView = null;
        boolean hasError = false;

        if (!isEmailValid(email)) {
            focusView = mEmailEditText;
            hasError = true;
            mEmailEditText.setError(getString(R.string.invalid_email));
        } else if (!isPasswordValid(password)) {
            focusView = mPasswordEditText;
            hasError = true;
            mPasswordEditText.setError(getString(R.string.invalid_password));
        } else if (verifyPass.isEmpty()) {
            focusView = mRetypedPasswordEditText;
            hasError = true;
            mRetypedPasswordEditText.setError(getString(R.string.missing_field));
        } else if (verifyPass.compareTo(password) != 0) {
            focusView = mRetypedPasswordEditText;
            hasError = true;
            mRetypedPasswordEditText.setError(getString(R.string.password_not_match));
        }

        if (hasError) {
            focusView.requestFocus();
        } else {
            showLoader(true);

            //populate the user to register
            //TODO should locations be added here when registering?
            //TODO could cause problems with final
            final ParseUser user = new ParseUser();
            user.setEmail(email);
            user.setPassword(password);
            user.setUsername(email);
            user.put(Consts.FIRST_NAME, mFirstNameEditText.getText().toString());
            user.put(Consts.LAST_NAME, mLastNameEditText.getText().toString());

            user.signUpInBackground(new SignUpCallback() {
                @Override
                public void done(ParseException e) {
                    showLoader(false);
                    if (e != null) {
                        mEmailEditText.setError(getString(R.string.error_email_exists));
                        mEmailEditText.requestFocus();
                    } else {
                        User.getInstance().setCurrentUser(user);
                        Intent mainActivity = new Intent(RegisterActivity.this, PlacesActivity.class);
                        mainActivity.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(mainActivity);
                        finish();
                    }
                }
            });
        }

    }
}