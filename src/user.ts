import Bluebird from 'bluebird';
import 'dotenv/config';
import inquirer from 'inquirer';
import { IgApiClient, IgCheckpointError, type AccountRepositoryLoginResponseLogged_in_user, type UserRepositoryInfoResponseUser } from 'instagram-private-api';
import fs from 'node:fs';

class IGUser {
  ig: IgApiClient;
  info: UserRepositoryInfoResponseUser;
  #username: string;
  #password: string;
  #sessionPath: string;
  constructor({ username, password }: { username: string; password?: string }) {
    console.log('\n');
    this.#username = username;
    this.#password = password;
    this.ig = new IgApiClient();
  }

  async setup() {
    this.#sessionPath = `_temp_json_states/${this.#username}.json`;
    // if (fs.existsSync(this.#sessionPath)) {
    // await this.ig.state.deserialize(fs.readFileSync(this.#sessionPath).toString());
    // } else {
    await this.auth();
    // }

    this.ig.request.end$.subscribe(async () => {
      await this.saveState();
    });

    await new Promise((resolve) => {
      Bluebird.try(async () => {
        this.info = await this.ig.user.info(this.ig.state.extractUserId());
      })
        .catch(IgCheckpointError, async () => {
          await this.authCheckpoint();
        })
        .catch((e) => console.log('Could not resolve checkpoint:', e, e.stack))
        .finally(() => {
          resolve();
        });
    });
  }

  async auth() {
    await new Promise((resolve) => {
      let loggedInUser: AccountRepositoryLoginResponseLogged_in_user;

      Bluebird.try(async () => {
        this.ig.state.generateDevice(this.#username);
        loggedInUser = await this.ig.account.login(this.#username, this.#password);
        console.log({ loggedInUser });
      })
        .catch(IgCheckpointError, async () => {
          await this.authCheckpoint();
        })
        .catch((e) => console.log('Could not resolve checkpoint:', e, e.stack))
        .then(async () => {
          await this.saveState();
        })
        .finally(async () => {
          resolve();
        });
    });
  }

  async authCheckpoint() {
    console.log({ checkpointInfo1: this.ig.state.checkpoint });
    await this.ig.challenge.auto(true);
    console.log({ checkpointInfo2: this.ig.state.checkpoint });

    // {
    //   checkpointInfo1: [Object: null prototype] {
    //     message: 'challenge_required',
    //     challenge: [Object: null prototype] {
    //       url: 'https://i.instagram.com/challenge/?next=/api/v1/users/311605544/info/',
    //       api_path: '/challenge/',
    //       hide_webview_header: true,
    //       lock: true,
    //       logout: false,
    //       native_flow: true,
    //       flow_render_type: 0
    //     },
    //     status: 'fail'
    //   }
    // }
    // {
    //   checkpointInfo2: [Object: null prototype] {
    //     message: 'challenge_required',
    //     challenge: [Object: null prototype] {
    //       url: 'https://i.instagram.com/challenge/?next=/api/v1/users/311605544/info/',
    //       api_path: '/challenge/',
    //       hide_webview_header: true,
    //       lock: true,
    //       logout: false,
    //       native_flow: true,
    //       flow_render_type: 0
    //     },
    //     status: 'fail'
    //   }
    // }

    const { code } = await inquirer.prompt([
      {
        type: 'input',
        name: 'code',
        message: 'Enter code',
      },
    ]);

    const challengeStateResponse = await this.ig.challenge.sendSecurityCode(code);
    console.log({ challengeStateResponse });
  }

  async saveState() {
    const serialized = await this.ig.state.serialize();
    delete serialized.constants;
    fs.writeFileSync(this.#sessionPath, JSON.stringify(serialized));
  }
}

export default IGUser;
