#include<iostream>
#include<vector>
#include<algorithm>
#include<cstring>
#include<fstream>//文件流

using namespace std;
class Student{
private:
	int nId;
	string sName;
	char sSex[3];
public:
	Student(){
		nId = 0;
		sName = "无名";
		strcpy(sSex, "??");
		//strcpy_s(sSex, 3, "??");
	}
	int id() const{
		return nId;
	}
	//friend int main();
	//重载输入、输出流必须用友元函数实现，不能使用成员函数
	friend istream &operator>>(istream &in, Student &stu);
	friend ostream &operator<<(ostream &out, const Student &stu);
public:
	static void saveToFile(const vector<Student>&a);
	static void readData(vector<Student>&a);
	static bool cmpByName(const Student &s1, const Student &s2){
		return s1.sName < s2.sName; //小于不交换（升序）
	}
};

//实现静态成员函数
void Student::saveToFile(const vector<Student>&a){
	const char sFileName[] = "d:\\Student.txt";
	ofstream myFile;

	//创建新文件，若文件存在则先删除
	myFile.open(sFileName);

	if(!myFile){
		throw "创建文件失败";
	}

	for(int i = 0; i < a.size(); i++){
		myFile<<a[i];
	}

	myFile.close();
}

void Student::readData(vector<Student>&a){
	const char sFileName[] = "d:\\Student.txt";
	ifstream myFile;//读文件

	//创建新文件，若文件存在则先删除
	myFile.open(sFileName);

	if(!myFile){
		return;
	}
	Student t;
	int nNum = 0;
	while(true){
		myFile>>t;//文件数据输入到学生对象中，格式有重载的运算符确定
		if(myFile.eof()){//读到文件末尾了
			break;
		}else{
			//把读到的数据存放在向量容器里
			//容器里存放的对象，push_back将进行拷贝构造
			a.push_back(t);
			nNum++;
		}
	}

	myFile.close();
	cout<<"\n共读取："<<nNum<<" 条记录"<<endl;
}

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

int main()
{
	vector<Student>a;

	Student::readData(a);

	Student t;

	while(true){
		cin>>t;
		if(t.id() <= 0){
			break;
		}
		//以下：将用 t 拷贝构造出一个新对象，并放在容器末尾
		a.push_back(t);
	}

	//显示学生
	for(int i = 0; i < a.size(); i++){
		cout<<a[i];
	}

	try{
		//调用静态成员函数，必须有【域限定】
		Student::saveToFile(a);

		//STL中的排序算法，第 3 个参数是比较函数
		std::sort(a.begin(), a.end(), Student::cmpByName);

		cout<<"\n\n-----------\n";
		//显示学生
		for(int i = 0; i < a.size(); i++){
			cout<<a[i];
		}
	}catch(const char *sErro){
		cout<<sErro<<endl;
	}
	return 0;
}
