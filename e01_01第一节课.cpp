#include<iostream> // i o 输入输出
#include<cstring>
using namespace std;//使用标准命名空间
  
class Student{  //定义一个类 Student 就是一个类 （类 抽象， shiling具体，又叫对象 
/*	private:      //表示私有，不可随意改动，改动需要成员函数？  private属性 
	        int nID;
			char sName[11];
	public:  //访问权限是公有的，可以修改 
	       int nAge;
	public:  
	    //void display(); 
	    void display(){
	    	cout<<nId<<"\t"<<sName<<"\t"<<nAge<<endl;
		}
	
*/	


/*
类中的函数：成员函数，也被叫做方法（method）
*/


//	修改： 
	
	private:    
	        int nID;
			char sName[11]; 
	        int nAge;
	public:
	    Student(){   //这是一个构造函数 
	    	nId = 2029;
	    	strcpy(sName,"张三")；//char数组不能直接用=来进行赋值，比如sName="张三"就是错的
			nAge=19; 
		} 
		//构造函数中cout是副作用
		//核心功能是给成员变量赋初值
	public:  
	   /* Student(int id, char *sName,int nAge){
	    	nId =id;
	    	strcpy(this->sName,sName);
	    	this->nAge = nAge;
	    	
	    	//构造函数不需要写返回值（有返回值），由系统判断 
			//直接就给成员变量赋值了
		}*/
		Student(int id, char* sName, int nAge)
			:nId(nId), nAge(nAge)//用形参nId创建出成员nId 
		{
			strcpy(this->sName, sName)
		};
		         
	public:
	    void display(){
	    	cout<<nId<<"\t"<<sName<<"\t"<<nAge<<endl;//注意是\不是/  是反斜线
	
	
	//一个类必须有构造函数，析构函数，拷贝构造函数，赋值运算函数 
	//当程序员没写，系统随意写 （占坑不干） 
	//构造函数的名称和类的名称一样 
	
	
	
	
	
	
	
};
int main(int argc,_TCHAR* argv[]) 
{
	Student stu;//创建了一个实例
	stu.nAge=19;
	stu.nId =1023;//此处错误，私有不能这样修改“更新” 
	
	//再有，需要对输入进行控制（1900岁）——数据的合法性——public和private的重要性
	
	stu.display();
	 
	return 0;
}







T1
    //接收整数与浮点数
	int i;
	float f;//在c中有%d %f
	cin>>i>>j;      //标准输入流的一个 
	                //c++ 中 自动识别，不用d f  
	 
	cout<<"hello,world\ni="<<i<<"\nj="<<j<<endl;  //cout 是标准输出流的一个  //类：学生   
	                            //enl 表示结束一行 

	//  \n 表示换行










//属性——对应c中 变量
//类——struct 升级版 

//把 属性和行为 作为整体来定义，这个过程称为封装 
-类与对象  


//继承（派生） 从一个简单的类 把属性和行为继承 再增加独特的属性和行为 


//多态？   图像的加法，矩阵的加法，算数的加法 是不一样的 
















//课后复习：

#include<iostream>
#include<cstring>

using namespace std;
class Student{
	private:
		int nID;
		char sname[11];
		int nage;
	public:
		Student(){
			nID=1012;
			strcpy(sname,"张三");
			nage=19;
		}
	public:
		void display(){
			cout<<nID<<"\n"<<sname<<"\n"<<nage<<endl;
		}
};
int main()
{
	Student stu;
	stu.display();
	return 0;
}





#include<iostream>
#include<cstring>

using namespace std;

class Student{
	private:
		int nID;
		int nage;
		char sname[11];
	public:
		Student(){
			nID=1012;
			strcpy(sname,"张三");
			nage=19;
		}
		
		Student(int nID,char* sname,int nage){
			this->nID=nID;
			this->nage=nage;
			strcpy(this->sname,sname);   //这里也要是this 
		}
	public:
		void display(){
			cout<<sname<<nage<<nID<<endl;
		}
	
};

int main()
{
	Student stu;

	
	stu.display();
	
	return 0;
}

//这两个函数不是重复了吗？为什么可以同时存在？
//不对，第二个函数内部作用是：把第一个函数中nID赋给第二个函数中的nID。
//但是这两个函数名字重复了？

//这两个构造函数并不重复，它们在C++中被称为函数重载。函数重载允许在同一个作用域内定义多个同名函数，只要它们的参数列表不同（参数的类型、个数或顺序不同）即可。
//
//第一个构造函数 Student() 没有参数，称为默认构造函数。
//
//第二个构造函数 Student(int nID, char* sname, int nage) 有三个参数，称为带参构造函数。
//
//编译器会根据创建对象时提供的参数来决定调用哪一个。
//在 main 函数中，Student stu; 没有传递参数，所以调用的是无参构造函数。如果创建对象时提供了三个参数，比如 Student stu2(1001, "李四", 20); ，则会调用带参构造函数。








#include<iostream>
#include<cstring>

using namespace std;

class Student{
	
	private:
		int nID;
		int nage;
		char sname[11];
	public:
		Student(){
			nID=1012;
			nage=19;
			strcpy(sname,"张三");
		}
		Student(int nID,int nage,char* sname)
		:nID(nID),nage(nage)
		{strcpy(this->sname,sname);//一定要用this 
		}
	public:
		void display(){
			cout<<nID<<nage<<sname<<endl;
		}
};
int main()
{
	Student stu(2025,19,"张三");  //注意，字符串  ""括起来的  会末尾自动添加一个空字符 \0
	stu.display();
	return 0;
}








#include<iostream>//输入输出流
using namespace std;//使用标准命名空间


char[3]对应位移是3个，所以012 加上一个空字符，所以只能存储两个字符
这个字符数组有3个元素，最大索引是2