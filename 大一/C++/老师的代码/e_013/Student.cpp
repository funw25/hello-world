// e12_02.cpp : 定义控制台应用程序的入口点。
//
#include "stdafx.h"
#include "Student.h"


istream &operator>>(istream &in, Student &stu){
	//动态判断 &in的指针类型，如果不是文件流。。。
	if(!dynamic_cast<ifstream *>(&in)){
		cout<<"输入学号、姓名、性别（学号为0，结束输入）"<<endl;
	}

	in>>stu.nId;
	if(stu.nId > 0){
		in>>stu.sName>>stu.sSex;
	}
	return in;
}
ostream &operator<<(ostream &out, const Student &stu){
	out<<"\t"<<stu.nId<<"\t"<<stu.sName<<"  "<<stu.sSex<<endl;
	return out;
}

//--------------------------------------
////////////////////////////////
//StuManage
//实现成员函数
void StuManage::saveToFile(){
	system("cls");
	const char sFileName[] = "d:\\Student.txt";
	ofstream myFile;

	//创建新文件，若文件存在则先删除
	myFile.open(sFileName);

	if(!myFile){
		throw "创建文件失败";
	}

	for(int i = 0; i < aStu.size(); i++){
		myFile<<*aStu[i];
	}

	myFile.close();
	cout<<"共保存 "<<aStu.size()<<" 个学生到 "<<sFileName<<" 中"<<endl;
	system("pause");
}

//把文件中的数据读到容器里
//注意，容器里装的是指针，而不是对象
void StuManage::readData(){
	const char sFileName[] = "d:\\Student.txt";
	ifstream myFile;//读文件

	//创建新文件，若文件存在则先删除
	myFile.open(sFileName);

	if(!myFile){
		return;
	}
	Student *t = NULL;
	int nNum = 0;
	while(true){
		t = new Student;
		myFile>>*t;//文件数据输入到学生对象中，格式有重载的运算符确定
		if(myFile.eof()){//读到文件末尾了
			delete t;
			break;
		}else{
			//把读到的数据存放在向量容器里
			//容器里存放的对象，push_back将进行拷贝构造
			aStu.push_back(t);
			nNum++;
		}
	}

	myFile.close();
	cout<<"\n共读取："<<nNum<<" 条记录"<<endl;
}


void StuManage::free(){
	for(int i = 0; i < aStu.size(); i++){
		delete aStu[i];
	}
	aStu.clear();//清空容器
}

void StuManage::display() const{
	system("cls");
	cout<<"学生信息（共 "<<aStu.size()<<"）"<<endl;
	for(int i = 0; i < aStu.size(); i++){
		cout<<*aStu[i];
	}
	//暂停，等候用户按一下键盘
	system("pause");
}

void StuManage::showMenu() const{
	system("cls");
	cout<<"1、输入学生数据"<<endl;
	cout<<"2、删除学生"<<endl;
	cout<<"3、显示学生"<<endl;
	cout<<"4、基于姓名排序"<<endl;
	cout<<"5、显示学生选课信息"<<endl;
	cout<<"6、保存学生数据"<<endl;
	cout<<"Esc 返回主菜单"<<endl;
}

void StuManage::handleMenu(){
	while(true){
		showMenu();
		int nKey = _getch();
		switch(nKey){
		case 49://输入
			inputStu();
			break;
		case 50://删除
			break;
		case 51://显示学生
			display();
			break;
		case 52://按姓名排序
			cmpByName();
			break;
		case 53://显示选课信息
			break;
		case 54://保持到文件
			saveToFile();
			break;
		case 27://Esc 返回主菜单
			return;
		}
	}
}

StuManage::StuManage(){
	//从文件中读取数据
	readData();
}

StuManage::~StuManage(){
	free();
}

//键盘输入学生
void StuManage::inputStu(){
	system("cls");
	Student *t = NULL;
	while(true){
		t = new Student;
		cin>>*t;
		if(t->id() <= 0){
			//这个学生不要，析构并结束输入
			delete t;
			break;
		}else{
			//将学生指针放入到容器末尾
			aStu.push_back(t);
		}
	}
}

//基于姓名排序
void StuManage::cmpByName(){
	system("cls");
	std::sort(aStu.begin(), aStu.end(), Student::cmpByName);
	cout<<"\n已完成基于姓名排序"<<endl;
	system("pause");
}


