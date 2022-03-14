import { React, useState} from 'react';
import { useRouter } from 'next/router';
import { useEffect } from 'react/cjs/react.development';


const FeedbackForm = () => {
      const [owner, setOwner] = useState('');
      const [repo, setRepo] = useState('');
      const router = useRouter();
      useEffect(() => {
        if (!router.isReady) return;
          // get the owner and repo from the url
          setOwner(router.query.owner);
          setRepo(router.query.repo);

      }, [router.isReady]);

      let initialValues = {
        type: "bug",
        title: "",
        email: "",
        comment: ""
      }
      const [formValues, setFormValues] = useState(initialValues);
      // console.log(formValues);

      /**
       * Set formValues to initial state
       *
       */
      const resetForm = () => {
        setFormValues(initialValues);
      }

      /**
       * Reset, set error or set success message for prompt after/before submit
       *
       * @param {*} [prompt=null|string] content of the prompt
       * @param {*} [type=null|string] "error" | "success" | null
       */
      const setPrompt = (prompt = null, type = null) => {
        switch (type) {
          case "error":
            document.getElementById("txt-prompt").innerHTML = `<div class="text-red-900">${prompt}</div>`;
            break;
          case "success":
            document.getElementById("txt-prompt").innerHTML = `<div class="text-green-800">${prompt}</div>`;
            break;
          default: // reset
            document.getElementById("txt-prompt").innerHTML = ``;
            break;
        }
      }

      /**
       * enable or disable button
       *
       * @param {boolean} shouldBeEnabled true to enable, false to disable
       */
      const toggleButton = (shouldBeEnabled) => {
        const submitButton = document.getElementById("gh-btn-submit");
        switch (shouldBeEnabled) {
          case false:
            submitButton.setAttribute("disabled", "disabled");
            submitButton.classList.remove("btn-submit-enabled");
            submitButton.classList.add("btn-submit-disabled");
            break;
          case true:
            submitButton.removeAttribute("disabled");
            submitButton.classList.remove("btn-submit-disabled");
            submitButton.classList.add("btn-submit-enabled");
          break;
          default:
            break;
        }
      }

      /**
       * update form values when one of the fields change
       *
       * @param {*} event Event object
       */
      const handleChange = (event) => {
        const { name, value } = event.target;
        setFormValues({ ...formValues, [name]: value });
      }

      /**
       * Submit form
       *
       * @param {*} event Event object
       */
      const handleSubmit = async (event) => {
        event.preventDefault();
        toggleButton(false);
        setPrompt();
        // console.log(formValues);

        // send formValues to /api/github POST method
        await fetch(`/api/github/${owner}/${repo}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formValues)
        }).then(response => {
          if (response.status >= 400 && response.status <= 500) { // error
            console.error(response);
            setPrompt(`Error: ${response.status} ${response.statusText}`, "error");
            toggleButton(true);
          } else { // not error
            resetForm();
            setPrompt(`Success: ${response.status} ${response.statusText}`, "success");
            toggleButton(true);
          }

        });  
      }

      return <form id="gh-feedback-form" onSubmit={handleSubmit}>
      <h1>Issue Report</h1>
      <input hidden type="text" name="repo" value={formValues.repo} onChange={handleChange} />
      <input hidden type="text" name="owner" value={formValues.owner} onChange={handleChange} />
      <div>
          <label htmlFor="gh-feedback-type">Type</label>
          <div className="flex flex-row">
            <div className="px-5"><input type="radio" name="type" value="bug" checked={formValues.type === "bug"} onChange={handleChange}/><span className="mx-2">Bug</span></div>
            <div className="px-5"><input type="radio" name="type" value="feedback" checked={formValues.type === "feedback"} onChange={handleChange}/><span className="mx-2">Feedback</span></div>
          </div>
      </div>
      <div>
        <label htmlFor="gh-feedback-title">Issue Name</label>
        <input type="text" id="gh-feedback-title" name="title" required placeholder="Briefly explain..." value={ formValues.title } onChange={handleChange}/>
      </div>
      <div>
        <label htmlFor="gh-feedback-email">Your Email</label>
        <input type="email" id="gh-feedback-sender-email" name="email" required placeholder="Type your email..." value={ formValues.email } onChange={handleChange}/>
      </div>
      <div>
        <label htmlFor="gh-feedback-comment">Comment</label>
        <textarea id="gh-feedback-comment" name="comment" required placeholder="Description..." value={ formValues.comment } onChange={handleChange}/>
      </div>
      <div>
        <input id="gh-btn-submit" className="inline-block btn-submit-enabled" type="submit" value="Send"/>
        <span id="txt-prompt" className="inline-block px-3"></span>
      </div>

    </form>;
}

export default FeedbackForm