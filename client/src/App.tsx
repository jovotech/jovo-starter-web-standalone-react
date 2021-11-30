import {
  AudioHelper,
  ClientEvent,
  ClientRequest,
  NormalizedOutputTemplate,
  SpeechRecognizerEvent,
  SpeechSynthesizerEvent,
} from '@jovotech/client-web';
import { observer } from 'mobx-react-lite';
import React from 'react';
import client from './client';
import RecordButton from './components/RecordButton';

interface AppProps {}

interface AppState {
  inputText: string;
  outputText: string;
}

const AppView = observer(({ inputText, outputText }: { inputText: string; outputText: string }) => {
  const content = !client.speechRecognizer.isAvailable ? (
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
    client.on(ClientEvent.Output, this.onOutput);
    client.speechRecognizer.on(SpeechRecognizerEvent.SpeechRecognized, this.onSpeechRecognized);
    client.speechSynthesizer.on(SpeechSynthesizerEvent.Speak, this.onSpeechSpeak);
  }

  componentWillUnmount() {
    client.off(ClientEvent.Request, this.onRequest);
    client.off(ClientEvent.Output, this.onOutput);
    client.speechRecognizer.off(SpeechRecognizerEvent.SpeechRecognized, this.onSpeechRecognized);
    client.speechSynthesizer.off(SpeechSynthesizerEvent.Speak, this.onSpeechSpeak);
  }

  render() {
    return <AppView inputText={this.state.inputText} outputText={this.state.outputText} />;
  }

  onSpeechRecognized = (event: SpeechRecognitionEvent) => {
    this.setState({
      inputText: AudioHelper.textFromSpeechRecognition(event),
    });
  };

  onRequest = (req: ClientRequest) => {
    if (req.input?.text) {
      this.setState({
        inputText: req.input.text,
      });
    }
  };

  onSpeechSpeak = (utterance: SpeechSynthesisUtterance) => {
    this.setState({
      outputText: utterance.text,
    });
  };

  onOutput = (output: NormalizedOutputTemplate) => {
    const theme = output.platforms?.web?.theme;
    if (this.isValidTheme(theme)) {
      this.toggleDarkMode(theme);
    }
  };

  private isValidTheme(theme?: unknown): theme is 'light' | 'dark' {
    return !!theme && typeof theme === 'string' && ['light', 'dark'].includes(theme);
  }

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
