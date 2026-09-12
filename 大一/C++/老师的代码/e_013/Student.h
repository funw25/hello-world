#pragma once

#include "manage.h"

class Student{
private:
	int nId;
	string sName;
	char sSex[3];
public:
	Student(){
		nId = 0;
		sName = "无名";
		//strcpy(sSex, "??");
		strcpy_s(sSex, 3, "??");
	}
	int id() const{
		return nId;
	}
	//friend int main();
	//重载输入、输出流必须用友元函数实现，不能使用成员函数
	friend istream &operator>>(istream &in, Student &stu);
	friend ostream &operator<<(ostream &out, const Student &stu);
public:
	static bool cmpByName(const Student *s1, const Student *s2){
		return s1->sName < s2->sName; //小于不交换（升序）
	}
};

//从抽象的管理类，派生出具体的【学生管理类】
class StuManage : public Manage{
private:
	vector<Student *>aStu;
public://实现父类的纯虚函数
	virtual void saveToFile();
	virtual void readData();
	virtual void free();
	virtual void display() const;
	virtual void showMenu() const;
	virtual void handleMenu();
public:
	StuManage();
	~StuManage();

	//键盘输入学生
	void inputStu();

	//基于姓名排序
	void cmpByName();
};
