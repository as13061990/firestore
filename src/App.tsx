import React from 'react';
import './App.css';

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  deleteDoc,
  addDoc,
  updateDoc
} from 'firebase/firestore';
const config = {
  apiKey: "AIzaSyBn6IHgaMzHQm1iGZ8j2VTRfgll26b_-fU",
  authDomain: "test-web-app-8b997.firebaseapp.com",
  projectId: "test-web-app-8b997",
  storageBucket: "test-web-app-8b997.appspot.com",
  messagingSenderId: "383581510961",
  appId: "1:383581510961:web:801b36e71461c2d4832410"
}
const app = initializeApp(config);
const db = getFirestore(app);

interface Iprops {}
interface Iuser {
  id?: string;
  first: string;
  last: string;
  born: number;
}
interface Istate {
  inputs: Iuser;
  users: Iuser[];
  find: {
    id: string;
    result: string;
  };
}

class App extends React.Component<Iprops, Istate> {
  constructor(props: Iprops) {
    super(props);
    this.state = {
      inputs: {
        first: '',
        last: '',
        born: 1800
      },
      users: [],
      find: {
        id: '',
        result: ''
      },
    }
  }

  private async add(): Promise<void> {
    if (this.state.inputs.first.length === 0) return;
    if (this.state.inputs.last.length === 0) return;
    if (this.state.inputs.born < 1800 || this.state.inputs.born > 2022) return;

    await addDoc(collection(db, 'users'), {
      first: this.state.inputs.first,
      last: this.state.inputs.last,
      born: this.state.inputs.born
    });
    this.setState({
      ...this.state,
      inputs: {
        first: '',
        last: '',
        born: 1800
      }
    })
    this.get();
  }

  private async find(): Promise<void> {
    if (this.state.find.id === '') {
      this.setState({
        ...this.state,
        find: {
          id: '',
          result: 'Enter user\'s ID'
        }
      });
      return;
    }

    const docRef = doc(db, 'users', this.state.find.id);
    const docSnap = await getDoc(docRef);
    const result = docSnap.exists() ? docSnap.data().first + ' ' + docSnap.data().last : 'No such document';

    this.setState({
      ...this.state,
      find: {
        id: '',
        result: result
      }
    });
  }

  private async get(): Promise<void> {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const users: Iuser[] = [];

    querySnapshot.forEach((doc) => {
      if (typeof doc.id !== 'string') return;
      if (typeof doc.data().first !== 'string') return;
      if (typeof doc.data().last !== 'string') return;
      if (typeof doc.data().born !== 'number') return;

      console.log(doc.id);
      
      const user: Iuser = {
        id: doc.id,
        first: doc.data().first,
        last: doc.data().last,
        born: doc.data().born
      }
      users.push(user);
    });

    this.setState({ ...this.state, users: users });
  }

  private async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'users', id));
    this.get();
  }
  
  private async update(id: string): Promise<void> {
    if (this.state.inputs.first.length === 0) return;
    if (this.state.inputs.last.length === 0) return;
    if (this.state.inputs.born < 1800 || this.state.inputs.born > 2022) return;

    const user = doc(db, 'users', id);
    await updateDoc(user, {
      first: this.state.inputs.first,
      last: this.state.inputs.last,
      born: this.state.inputs.born
    });
    this.setState({
      ...this.state,
      inputs: {
        first: '',
        last: '',
        born: 1800
      }
    })
    this.get();
  }

  private buildUsers(): JSX.Element[] {
    return this.state.users.map(user => {
      return (
        <div key={ user.id }>
          <p>{ user.first } { user.last } <span>was born in</span> { user.born } <button onClick={() => this.choose(user.id) }>change</button><button onClick={ () => this.delete(String(user.id)) }>delete</button></p>
        </div>
      );
    });
  }

  private buildButtons(): JSX.Element {
    if (this.state.inputs.id) {
      return (
        <>
          <button onClick={ () => this.update(String(this.state.inputs.id)) }>update</button>
          <button onClick={ () => this.choose() }>cancel</button>
        </>
      );
    }
    return (
      <button onClick={ () => this.add() }>add</button>
    );
  }

  private choose(id?: string): void {
    const user = this.state.users.find(user => user.id === id);
    const inputs = user ? user : {
      id: id,
      first: '',
      last: '',
      born: 1800
    }

    this.setState({
      ...this.state,
      inputs: inputs
    });
  }

  private changeFirst(first: string): void {
    this.setState({
      ...this.state,
      inputs: {
        ...this.state.inputs,
        first: first
      }
    });
  }

  private changeLast(last: string): void {
    this.setState({
      ...this.state,
      inputs: {
        ...this.state.inputs,
        last: last
      }
    });
  }

  private changeBorn(born: number): void {
    this.setState({
      ...this.state,
      inputs: {
        ...this.state.inputs,
        born: born
      }
    });
  }

  private changeFind(id: string): void {
    this.setState({
      ...this.state,
      find: {
        ...this.state.find,
        id: id
      }
    });
  }

  public componentDidMount(): void {
    this.get();
  }

  public render(): JSX.Element {
    const users = this.buildUsers();
    const buttons = this.buildButtons();

    return (
      <div className='App'>
        { users }
        <div className='inputs'>
          <input
            type='text'
            placeholder='first'
            value={ this.state.inputs.first }
            onChange={ (e) => this.changeFirst(e.target.value) }
          />
          <input
            type='text'
            placeholder='last'
            value={ this.state.inputs.last }
            onChange={ (e) => this.changeLast(e.target.value) }
          />
          <input
            type='number'
            placeholder='born'
            value={ this.state.inputs.born }
            min={ 1800 }
            max={ 2022 }
            onChange={ (e) => this.changeBorn(Number(e.target.value)) }
          />
          { buttons }
        </div>
        <div className='find'>
          <input
            type='text'
            placeholder='find by ID'
            value={ this.state.find.id }
            onChange={ (e) => this.changeFind(e.target.value) }
          />
          <button onClick={ () => this.find() }>find</button>
          <p>{ this.state.find.result }</p>
        </div>
      </div>
    );
  }
}

export default App;