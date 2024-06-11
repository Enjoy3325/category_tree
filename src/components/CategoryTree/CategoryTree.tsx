"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import { collection, addDoc, getDoc, setDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { nanoid } from "nanoid";
import styles from "./CategoryTree.module.scss";

interface Category {
  id: string;
  name: string;
  children: Category[];
  expanded?: boolean;
}

export const CategoryTree: React.FC = () => {
  const [tree, setTree] = useState<Category[]>([]);
  const [newRootCategoryName, setNewRootCategoryName] = useState("");
  const [isRootCategoryAdded, setIsRootCategoryAdded] = useState(false);

  // useEffect(() => {
  //   const loadTree = async () => {
  //     const querySnapshot = await getDocs(collection(db, "categories"));
  //     const categories = querySnapshot.docs.map(doc => doc.data() as Category);
  //     setTree(categories);
  //   };
  //   loadTree();
  // }, []);

  useEffect(() => {
    loadTree();
  }, []);

  const findCategory = (nodes: Category[], id: string): Category | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      const foundChild = findCategory(node.children, id);
      if (foundChild) return foundChild;
    }
    return null;
  };

  const findParentCategory = (nodes: Category[], id: string): Category | null => {
    for (const node of nodes) {
      for (const child of node.children) {
        if (child.id === id) return node;
        const foundParent = findParentCategory(child.children, id);
        if (foundParent) return foundParent;
      }
    }
    return null;
  };

  const toggleVisibility = async (id: string) => {
    const newTree = [...tree];
    const node = findCategory(newTree, id);
    if (node) {
      node.expanded = !node.expanded;
      setTree(newTree);
      await saveTree(newTree);
    }
  };

  const toggleChildVisibility = (node: Category, state: boolean) => {
    node.children.forEach((child) => {
      child.expanded = state;
      toggleChildVisibility(child, state);
    });
  };

  const addRootCategory = async () => {
    if (!newRootCategoryName) return;

    const id = nanoid();
    const newCategory: Category = { id, name: newRootCategoryName, children: [], expanded: true };
    const newTree = [...tree, newCategory];
    setTree(newTree);
    setNewRootCategoryName("");
    await saveTree(newTree);
  };

  const addCategory = async (parentId: string) => {
    const name = prompt("Enter category name:");
    if (!name) return;

    const id = nanoid();
    const newCategory: Category = { id, name, children: [], expanded: true };

    const newTree = [...tree];
    const parent = findCategory(newTree, parentId);
    if (parent) {
      parent.children.push(newCategory);
      setTree(newTree);
      await saveTree(newTree);
    }
  };

  const renameCategory = async (id: string) => {
    const name = prompt("Enter new category name:");
    if (!name) return;

    const newTree = [...tree];
    const category = findCategory(newTree, id);
    if (category) {
      category.name = name;
      setTree(newTree);
      await saveTree(newTree);
    }
  };

  const deleteCategory = async (id: string) => {
    const newTree = deleteNode([...tree], id);
    setTree(newTree);
    await saveTree(newTree);
  };

  const deleteNode = (nodes: Category[], id: string): Category[] => {
    return nodes.reduce((acc, node) => {
      if (node.id === id) return acc;

      const updatedChildren = deleteNode(node.children, id);
      acc.push({ ...node, children: updatedChildren });
      return acc;
    }, [] as Category[]);
  };

  const handleCategoryNameChange = async (id: string, name: string) => {
    const newTree = [...tree];
    const category = findCategory(newTree, id);
    if (category) {
      category.name = name;
      setTree(newTree);

      try {
        const categoryDocRef = doc(db, "categories", id);
        await updateDoc(categoryDocRef, { name });
      } catch (e) {
        console.error("Error updating document: ", e);
      }
    }
  };

  const saveTree = async (categories: Category[]) => {
    try {
      await setDoc(doc(db, "categories", "tree"), { categories });
    } catch (error) {
      console.error("Error saving document: ", error);
    }
  };

  const loadTree = async () => {
    try {
      const docRef = doc(db, "categories", "tree");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setTree(data.categories || []);
      }
    } catch (error) {
      console.error("Error loading document: ", error);
    }
  };


  const renderTree = (node: Category) => {
    return (
      <div className={styles.category} key={node.id}>
        {node.name ? (
          <>
            <span className={styles["toggle"]} onClick={() => toggleVisibility(node.id)}>
              {node.expanded ? (
                <div className={styles.toggleBox}>-</div>
              ) : (
                <div className={styles.toggleBox}>+</div>
              )}
            </span>
            <span className={styles["categoryName"]}>{node.name}:</span>
            <div className={styles.buttonWrapper}>
              <button className={styles["buttonTree"]} onClick={() => renameCategory(node.id)}>
                Rename
              </button>
              <button className={styles["buttonTree"]} onClick={() => addCategory(node.id)}>
                Add
              </button>
              <button className={styles["buttonTree"]} onClick={() => deleteCategory(node.id)}>
                Delete
              </button>
            </div>
          </>
        ) : (
          <input
            className={styles.inputRoot}
            type="text"
            placeholder="Enter category name"
            onBlur={(e) => handleCategoryNameChange(node.id, e.target.value)}
          />
        )}
        {node.children && node.children.length > 0 && (
          <div
            className={`${styles.subcategories} ${node.expanded ? styles.expanded : styles.hidden
              }`}>
            {node.children.map(renderTree)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>List categories</h1>
      <div className={styles.newRootCategoryWrapper}>
        <input
          className={styles.inputRoot}
          type="text"
          value={newRootCategoryName}
          onChange={(e) => setNewRootCategoryName(e.target.value)}
          placeholder="Enter new root category name"
        />
        <button className={styles.buttonTree} onClick={addRootCategory}>
          Add Root Category
        </button>
      </div>
      {tree.length > 0 && <div className={styles.catalog}>{tree.map(renderTree)}</div>}
    </div>
  );
};
