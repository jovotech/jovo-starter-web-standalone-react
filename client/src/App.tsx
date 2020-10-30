import {
  Action,
  ActionType,
  AudioHelper,
  ClientEvent,
  RequestType,
  SpeechRecognizerEvent,
  SpeechSynthesizerEvent,
  WebRequest,
  WebResponse,
} from 'jovo-client-web';
import {observer} from 'mobx-react-lite';
import React from 'react';
import client from './client';
import RecordButton from './components/RecordButton';

interface AppProps {}

interface AppState {
  inputText: string;
  outputText: string;
}

const AppView = observer(({ inputText, outputText }: { inputText: string; outputText: string }) => {
  const content = !client.$speechRecognizer.isAvailable ? (
    <div className="px-8">
      <p className="text-lg text-center text-gray-800 dark:text-gray-400">
        This demo uses the Chrome Web Speech API, which unfortunately isn't supported in this
        browser.
      </p>
    </div>
  ) : (
    <React.Fragment>
      <div className="flex flex-col flex-grow justify-center items-center">
        <div className="px-8">
          <p className="text-lg text-center text-gray-800 dark:text-gray-400">{outputText}</p>
        </div>
      </div>
      <div className="flex flex-col flex-shrink-0 mt-auto justify-center items-center mb-16">
        <div className="mb-4 px-8">
          <p className="text-base text-center text-gray-800 dark:text-gray-400">{inputText}</p>
        </div>
        <RecordButton isRecording={client.isRecordingInput} isInitialized={client.isInitialized} />
      </div>
    </React.Fragment>
  );

  return (
    <div className="flex flex-col w-screen h-screen bg-gray-300 dark:bg-gray-900">
      <div className="flex flex-col flex-grow justify-center items-center">{content}</div>
    </div>
  );
});

class App extends React.Component<AppProps, AppState> {
  constructor(props: Readonly<AppProps> | AppProps) {
    super(props);
    this.state = { inputText: '', outputText: 'Press the button below to get started.' };
  }

  componentDidMount() {
    client.on(ClientEvent.Request, this.onRequest);
    client.on(ClientEvent.Response, this.onResponse);
    client.on(ClientEvent.Action, this.onAction);
    client.$speechRecognizer.on(SpeechRecognizerEvent.SpeechRecognized, this.onSpeechRecognized);
    client.$speechSynthesizer.on(SpeechSynthesizerEvent.Speak, this.onSpeechSpeak);
  }

  componentWillUnmount() {
    client.off(ClientEvent.Request, this.onRequest);
    client.off(ClientEvent.Response, this.onResponse);
    client.off(ClientEvent.Action, this.onAction);
    client.$speechRecognizer.off(SpeechRecognizerEvent.SpeechRecognized, this.onSpeechRecognized);
    client.$speechSynthesizer.off(SpeechSynthesizerEvent.Speak, this.onSpeechSpeak);
  }

  render() {
    return <AppView inputText={this.state.inputText} outputText={this.state.outputText} />;
  }

  onSpeechRecognized = (event: SpeechRecognitionEvent) => {
    this.setState({
      inputText: AudioHelper.textFromSpeechRecognition(event),
    });
  };

  onRequest = (req: WebRequest) => {
    if (req.request.type === RequestType.Text || req.request.type === RequestType.TranscribedText) {
      this.setState({
        inputText: req.request.body.text || '',
      });
    }
  };

  onResponse = (res: WebResponse) => {
    if (res.context.request.asr?.text) {
      this.setState({ inputText: res.context.request.asr.text });
    }
  };

  onSpeechSpeak = (utterance: SpeechSynthesisUtterance) => {
    this.setState({
      outputText: utterance.text,
    });
  };

  onAction = (action: Action) => {
    if (action.type === ActionType.Custom) {
      switch (action.command) {
        case 'set-theme': {
          this.toggleDarkMode(action.value);
          break;
        }
        default:
      }
    }
  };

  private toggleDarkMode(theme: 'dark' | 'light') {
    if (theme === 'dark') {
      if (!document.documentElement.classList.contains('mode-dark')) {
        document.documentElement.classList.add('mode-dark');
      }
    } else if (theme === 'light') {
      if (document.documentElement.classList.contains('mode-dark')) {
        document.documentElement.classList.remove('mode-dark');
      }
    }
  }
}

export default App;
