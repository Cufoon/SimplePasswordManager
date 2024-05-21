import { useCallback, useEffect, useState } from 'react';
import Button from '$components/button';
import styles from './home.module.scss';
import Modal from '$components/modal';

interface PasswdItem {
  mark: string;
  username: string;
  password: string;
}

function Home() {
  const [ek, setEK] = useState<string>('');
  const [ekSetting, setEKSetting] = useState<string>('');
  const [showEKSetModal, setShowEKSetModal] = useState(false);

  const [filePath, setFilePath] = useState<string>('');
  const [passwords, setPasswords] = useState<PasswdItem[]>([]);

  const [showPasswordAddModal, setShowPasswordAddModal] = useState(true);
  const [mark, setMark] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const loadFile = useCallback(async () => {
    try {
      const path = await window.electronAPI.openFile();
      if (path !== '' && path !== undefined) {
        setFilePath(path);
        const content = await window.electronAPI.readFile(path, ek);
        console.log(content);
        setPasswords(JSON.parse(content));
      }
    } catch (e: unknown) {
      setFilePath('');
      setPasswords([]);
      alert(e);
    }
  }, [ek]);

  const writeFile = useCallback(async () => {
    await window.electronAPI.writeFile(filePath, ek, JSON.stringify(passwords));
  }, [ek, filePath, passwords]);

  const hidePasswordAddModal = () => {
    setShowPasswordAddModal(false);
    setMark('');
    setUsername('');
    setPassword('');
  };

  const hideEKSetModal = () => {
    setShowEKSetModal(false);
    setEKSetting('');
  };

  const addPassword = () => {
    const item = {
      mark: mark,
      username: username,
      password: password
    };
    setPasswords((pre) => {
      return [...pre, item];
    });
    hidePasswordAddModal();
  };

  const deletePassword = (index: number) => {
    setPasswords((pre) => {
      return [...pre.slice(0, index), ...pre.slice(index + 1)];
    });
  };

  useEffect(() => {
    (async () => {
      const _ek = await window.electronAPI.getEK();
      setEK(_ek);
    })();
  }, []);

  const updateEK = async () => {
    setEK(ekSetting);
    await window.electronAPI.setEK(ekSetting);
    hideEKSetModal();
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerTitle}>
        {`当前打开文件: ${filePath || '未打开任何文件'}`}
      </div>
      <div className={styles.header}>
        <div className={styles.headerOnePart}>
          <Button
            content='读取'
            onClick={() => {
              loadFile().then();
            }}
          />
          <Button
            content='写入'
            onClick={() => {
              writeFile().then();
            }}
          />
        </div>
        <div className={styles.headerOnePart}>
          <Button
            content='设置密码'
            onClick={() => {
              setShowEKSetModal(true);
            }}
          />
          <Button
            content='添加'
            onClick={() => {
              setShowPasswordAddModal(true);
            }}
          />
        </div>
      </div>
      <div className={styles.list}>
        {passwords.map((item, idx) => {
          return (
            <div
              className={styles.listItem}
              key={`${item.mark}-${item.username}`}
            >
              <div className={styles.listItemHeader}>
                <div>{item.mark}</div>
                {item.username && <div>{item.username}</div>}
              </div>
              <div className={styles.listItemContent}>{item.password}</div>
              <div className={styles.listItemOperate}>
                <Button
                  content='删除密码'
                  className={styles.listItemOperateButton}
                  onClick={() => deletePassword(idx)}
                />
              </div>
            </div>
          );
        })}
      </div>
      <Modal
        visible={showPasswordAddModal}
        changeVisible={setShowPasswordAddModal}
        title='添加一个密码'
        onCancel={hidePasswordAddModal}
        onOk={addPassword}
      >
        <div>备注</div>
        <div>
          <input
            className={styles.modalInput}
            value={mark}
            onChange={(e) => setMark(e.target.value)}
          />
        </div>
        <div>用户名</div>
        <div>
          <input
            className={styles.modalInput}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>密码</div>
        <div>
          <input
            className={styles.modalInput}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </Modal>
      <Modal
        visible={showEKSetModal}
        changeVisible={setShowEKSetModal}
        title='设置密钥库密码'
        onCancel={hideEKSetModal}
        onOk={updateEK}
      >
        <div>密码</div>
        <div>
          <input
            className={styles.modalInput}
            value={ekSetting}
            onChange={(e) => setEKSetting(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}

export default Home;
