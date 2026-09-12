/*
【类与对象】
1、一个类必须有：
  构造函数：
  1、初始化【常成员变量】
  2、初始化【对象型成员】
  3、创建父类（也叫基类） 
  4、创建最远虚基类 
   
  析构函数：当需要释放资源（如：内存）时，应在析构函数里进行 
  拷贝构造函数：
  1)实参传形参
  2)函数返回的是对象 
  3)显示调用 
  赋值运算（当需要深拷贝）

2、一些特殊的成员：
  常成员：常数据成员必须在构造函数的【外部初始化】 
  静态成员
  
3、浅拷贝和深拷贝 
 【浅拷贝】是两个或多个指针指向同一块内存
 【深拷贝】是两个或多个指针指向不同内存，内存中数据一样 
*/

#include <iostream>//输入/输出流
#include <string.h> 
using namespace std;//使用【标准命名空间】

//a,b是【引用型】实参，它的改变将影响实参 
//引用并不会产生新的对象，它就是实参，是实参的别名 
void Swap(int &a,int &b) {
	int x=a;a=b;b=x;
}

class Clock{

private://取值收到约束 
	//const int nTest;//常数据成员 
	int H;
	int M;
	int S;
	
	char *pBuff;

public:
	/*
	//无参构造 
	Clock():H(0),M(0),S(0){		
	}
	//带参构造 
	Clock(int H,int M,int S){//:H(H),M(M),S(S){		
	    //构造函数参数值异常，只能抛出异常来应对 
		if (H<0||H>=24) {
			//throw "无效的小时值";
			H=0;//M S如法炮制 
		}
		this->H=H;this->M=M;this->S=S;
	}
	*/
	//具有【默认值】的带参构造 
	Clock(int H=1,int M=2,int S=3,const char *s=nullptr) {//后面赋值则用赋值，未赋值则用默认值（将无参构造和带参构造合二为一） 
		if (H<0||H>=24) {
			//throw "无效的小时值";
			H=0;//M S如法炮制 
		}
		this->H=H;this->M=M;this->S=S;//this->H是成员变量，H是形参 
		
		if (s==nullptr) {
			pBuff=nullptr;
		} else {
			//申请内存（不要使用malloc） 
			//new必须对于delete，否则将导致内存泄露 
			//以下先申请【独立内存】，再把数据拷贝过去，叫：深拷贝 
			pBuff=new char[strlen(s)+1];
			strcpy(pBuff,s);
		}
		
		cout<<"【构造被调用】"<<endl; 
	}
	
	//构造函数的形参是该类的【引用型对象】
	//则它是【拷贝构造函数】
	//使用引用后又不希望其值被改变，则可【左修饰】为const，称为【常引用】 
	Clock (const Clock &src) {
		H=src.H;M=src.M;S=src.S;
		
		//指针直接赋予地址，叫【浅拷贝】 
		//pBuff=src.pBuff;
		
		if (src.pBuff==nullptr) {
			pBuff=nullptr;
		}else {
			//以下为【深拷贝】 
			pBuff=new char[strlen(src.pBuff)+1];
			strcpy(pBuff,src.pBuff); 
		}
		
		cout<<"【拷贝构造】"<<endl;
	}
	
	//析构函数，当对象被摧毁时，系统自动调用析构函数
	//析构的主要功能是，释放申请的资源 
	~Clock() {
		if (pBuff!=nullptr) {
			cout<<"析构将释放："<<pBuff<<endl;
			delete[]pBuff;
			//当new的时候带有[]，则delete也要带[] 
		}else{
			cout<<"析构,pBuff为空"<<endl;
		}
	}

public:
	//右修饰const，常成员函数(对一个函数只读不改） 
	void display() const{
		cout<<H<<":"<<M<<":"<<S<<endl;
	}
};

int main () {
	
	//创建c1、c2、c3系统自动调用构造函数 
	Clock c1(0,0,0,"Hello,SWJTU");
	Clock c2(23,59,59,"大家好");
	Clock c3(11);
	
	//创建c4、c5调用的是【拷贝构造函数】 
	Clock c4 = c2;//这里不是赋值运算，是【拷贝构造】 
	//Clock c5(c2);
	
	//当需要深拷贝时，必须重载赋值运算 
	//c4=c2;//这里是赋值运算，系统默认的赋值运算是浅拷贝 
	
	//对象数组必须要求【无参构造】 
	Clock aClock[5];
	
	c1.display();
	c2.display();
	c3.display();
	for (int i=0;i<5;i++) {
		aClock[i].display();
	} 
	
	cout<<"\n\n";
	int aa=888;
	int &bb=aa;
	
	bb=666666;
	cout<<"aa="<<aa<<endl;
	
	return 0;
} 
